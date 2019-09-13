let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'password_curso';

exports.ensureAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({message: "La peticion no tiene la cabecera de Autentificacion"})
    }
    let token = req.headers.authorization.replace(/['"]+/g, '');
    let payload = jwt.decode(token, secret);
    try {
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }
    } catch (e) {
        return res.status(404).send({
            message: 'El token no es valido'
        });
    }
    req.user = payload;
    next();
};