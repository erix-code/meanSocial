let user = require('../models/User');
let bcrypt = require('bcrypt-nodejs');
let jwt = require('../services/jwt');
let mongoosePaginate = require('mongoose-pagination');
let fs = require('fs');
let path = require('path');

//Funcion de prueba
function home(req, res) {
    res.status(200).send({
        message: "HOla mundo"
    });
}


//Funcion de prueba
function tests(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'This is a test'
    });
}

//Funcion para almacenar datos de un usuario
function saveUser(req, res) {
    var params = req.body;
    let user = new user();

    if (params.name && params.surname &&
        params.nick && params.email &&
        params.password) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick.toLowerCase();
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        //Controlar si existen usuarios duplicados
        user.find
        ({
            $or: [
                {email: user.email},
                {nick: user.nick}
            ]
        }).exec((error, users) => {
            if (error) return res.status(500).send({
                message: "Error en la peticion de usuarios"
            });
            if (users && users.length >= 1) {
                return res.status(200).send({
                    message: 'Username is already in use'
                })
            } else {
                //Encriptar la contrasena
                bcrypt.hash(params.password, null, null, (error, hash) => {
                    user.password = hash;
                    user.save((error, userStored) => {
                        if (error) return res.status(500).send({
                            message: 'Error'
                        });
                        if (userStored) {
                            res.status(200).send({
                                user: userStored
                            });
                        } else {
                            res.status(404).send({
                                message: 'No se registro el usuario'
                            });
                        }
                    });
                });
            }
        });
        //Cifra la password y guarda los datos

    } else {
        res.status(200).send({
            message: 'Send all the data'
        });
    }
}

//Funcion de autentificacion de un Usuario
function loginUser(req, res) {
    let params = req.body;
    let email = params.email;
    let password = params.password;

    user.findOne({
        email: email
    }, (error, user) => {
        if (error) return res.status(500).send({message: 'Error in the Request'});
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    //return data of the User
                    if (params.gettoken) {
                        //devolver token
                        //generar token
                        //devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //devolver datos de usuario
                        user.password = undefined;
                        return res.status(200).send({user});
                    }
                } else {
                    return res.status(404).send({message: 'El usuario no se ha podido identificar'});
                }
            });
        } else {

            return res.status(404).send({message: 'El usuario no se ha podido identificar'});
        }
    });
}

//Conseguir datos de un usuario

function getUser(req, res) {
    let userId = req.params.id;
    user.findById(userId, (err, user) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!user) return res.status(404).send({
            message: 'El usuario no existe'
        });
        return res.status(200).send({user});
    });
}

//Devolver un listado de los usuarios paginado
function getUsers(req, res) {
    let identityUserId = req.user.sub;
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    let itemsPerPage = 5;
    user.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!users) return res.status(404).send({
            message: 'No hay usuarios disponibles'
        });
        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    });
}

//Edicion de datos de usuario
function updateUser(req, res) {
    let userId = req.params.id;
    let update = req.body;
    //Borrar la propiedad Password
    delete update.password;
    if (userId != req.user.sub) {
        return res.status(500).send({message: "No tienes permisos para actualizar los datos del usuario"})
    }
    user.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!userUpdated) return res.status(404).send({
            message: 'No se ha podido actualizar el Usuario'
        });
        return res.status(200).send({
            user: userUpdated
        });
    });
}

// Subir archivos de imagen/Avatar de usuario
function uploadImage(req, res) {
    let userId = req.params.id;

    if (req.files) {
        let file_path = req.files.image.path;
        console.log(file_path);

        let file_split = file_path.split('/');
        console.log(file_split);

        let file_name = file_split[2];
        console.log(file_split[2]);

        let ext_split = file_name.split('.');
        let file_ext = ext_split[1];
        console.log(file_ext);
        if (userId !== req.user.sub) {
            console.log('No tienes permisos para actualizar los datos del usuario');
            //Se debe poner un return para que acabe esta funcion si no no acabaria ya que el return debe ser desde la funcion
            return removeFilesOfUploads(res, file_path, "No tienes permisos para actualizar los datos del usuario");
        }
        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            //acutualizar documento de usuario logueado
            user.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdated) => {
                if (err) return res.status(500).send({
                    message: 'Error en la peticion'
                });
                if (!userUpdated) return res.status(404).send({
                    message: 'No se ha podido actualizar el Usuario'
                });
                return res.status(200).send({
                    user: userUpdated
                });
            });
        } else {
            //En caso de que la extension sea mala
            console.log("NO ES UNA EXTENSION VALIDA")
            return removeFilesOfUploads(res, file_path, "Extension no valida");
        }
    } else {
        return res.status(200).send({
            message: 'No se han subido imagenes'
        });
    }
}


function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({
            message: message
        });
    });
}

function getImageFile(req,res){
    let image_file = req.params.imageFile;
    let path_file = './uploads/users/'+image_file;

    fs.exists(path_file,(exists)=>{
        if (exists){
            res.sendFile(path.resolve(path_file));
        }
        else{
            res.status(200).send({
                message: 'No existe la imagen'
            });
        }
    });
}
module.exports = {
    home,
    tests,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile
};