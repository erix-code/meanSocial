// let path = require('path');
// let fs = require('fs');
let mongoosePaginate = require('mongoose-pagination');

let User = require('../models/User');
let Follow = require('../models/Follow');

function test(req, res) {
    res.status(200).send({
        message: 'Hola mundo desde el contraolador follow'
    });
}

function saveFollow(req, res) {
    let params = req.body;
    let follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;
    follow.save((err, followStored) => {
        if (err) return res.status(500).send({
            message: 'Error al guardar el seguimiento'
        });
        if (!followStored) return res.status(404).send({
            message: 'El seguimiento no se ha guardado'
        });
        return res.status(200).send({
            message: 'Guardado exitosamente'
        });
    });
}

function deleteFollow(req, res) {
    let userId = req.user.sub;
    let followId = req.params.id;

    Follow.find({
        'user': userId,
        'followed': followId
    }).remove(err => {
        if (err) return res.status(500).send({
            message: 'Error al dejar de seguir'
        });
        return res.status(200).send({
            message: 'El follow se ha eliminado'
        });
    });
}

module.exports = {
    test,
    saveFollow,
    deleteFollow
};