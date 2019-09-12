let User = require('../models/User');
let bcrypt = require('bcrypt-nodejs');

function home(req, res) {
    res.status(200).send({
        message: "HOla mundo"
    });
}

function tests(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'This is a test'
    });
}

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


module.exports = {
    home, tests,
    saveUser
}