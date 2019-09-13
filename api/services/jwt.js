let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'password_curso';
//Generar un token JWT
exports.createToken = function (user) {
    let payload = {
        sub: user._id,
        nick: user.nick,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.rows,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };
    return jwt.encode(payload, secret);
};