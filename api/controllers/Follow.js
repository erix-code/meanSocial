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

function getFollowingUsers(req, res) {
    let userId = req.user.sub;
    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }
    let itemsPerPage = 4;
    Follow.find({user: userId}).populate({
        path: 'followed'
    }).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({
            message: "Error en el servidor"
        });
        if (!follows) return res.status(404).send({
            message: "No esta siguiendo ningun usuario"
        });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        })
    });
}

function getFollowedUsers(req, res) {
    let userId = req.user.sub;
    //Comprobar los parametros por la URL
    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }
    let itemsPerPage = 4;
    Follow.find({followed: userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({
            message: "Error en el servidor"
        });
        if (!follows) return res.status(404).send({
            message: "No te sigue ningun usuario"
        });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        })
    });
}

//Devolver listados de usuarios
function getMyFollows(req, res) {
    let userId = req.user.sub;
    let find = Follow.find({
        user: userId
    });
    if (req.params.followed){
        find = Follow.find({
            followed:userId
        });
    }
    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({
            message: "Error en el servidor"
        });
        if (!follows) return res.status(404).send({
            message: 'No sigues a ningun usuario'
        });
        return res.status(200).send({
            follows
        });
    });
}

//Devolver usuarios que nos siguen


module.exports = {
    test,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
};