let User = require('../models/User');
let bcrypt = require('bcrypt-nodejs');
let jwt = require('../services/jwt');
let mongoosePaginate = require('mongoose-pagination');
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
    let user = new User();

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
        User.find
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

    User.findOne({
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
    User.findById(userId, (err, user) => {
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
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!users) return res.status(404).send({
            message: 'No hay usuarios disponibles'
        });
        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
    });
}

module.exports = {
    home,
    tests,
    saveUser,
    loginUser,
    getUser,
    getUsers
};