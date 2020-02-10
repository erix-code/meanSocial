let path = require('path');
let fs = require('fs');
let moment = require('moment');
let mongoosePaginate = require('mongoose-pagination');

let Publication = require('../models/Publication');
let User = require('../models/User');
let Follow = require('../models/Follow');

function test(req, res) {
    res.status(200).send({
        message: 'Hola desde esl controlador de publicaciones'
    });
}

function savePublication(req, res) {
    let params = req.body;
    if (!params.text) {
        return res.status(200).send({
            message: 'Debes enviar un texto'
        });
    }
    let publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment();
    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({
            message: 'Error al guardar la publicacion'
        });
        if (!publicationStored) return res.status(404).send({
            message: 'La publicacion no ha sido guardada'
        });
        return res.status(200).send({
            message: publicationStored
        });
    })
}

function getPublications(req, res) {
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 4;
    var follows_clean = [];
    Follow.find({"user": req.user.sub}).populate('followed').exec().then((follows) => {
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        follows_clean.push(req.user.sub);
        Publication.find(
            {user: {"$in": follows_clean}})
            .sort('-created_at')
            .populate('user')
            .paginate(page, itemsPerPage,
                (err, publications, total) => {
                    if (err) return res.status(404).send({message: 'Error devolver publicaciones' + err});
                    if (!publications) return res.status(500).send({message: 'No hay publicaciones'});

                    return res.status(200)
                        .send(
                            {
                                total_items: total,
                                pages: Math.ceil(total / itemsPerPage),
                                page: page,
                                publications
                            }
                        )
                });
    });

}

function getUserPublications(req, res) {
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    let user = req.params.sub;
    if (req.params.user) {
        user = req.params.user;
    }
    var itemsPerPage = 4;
    Publication.find(
        {user: user})
        .sort('-created_at')
        .populate('user')
        .paginate(page, itemsPerPage,
            (err, publications, total) => {
                if (err) return res.status(404).send({message: 'Error devolver publicaciones' + err});
                if (!publications) return res.status(500).send({message: 'No hay publicaciones'});

                return res.status(200)
                    .send(
                        {
                            total_items: total,
                            pages: Math.ceil(total / itemsPerPage),
                            page: page,
                            publications
                        }
                    )
            });

}

function getPublication(req, res) {
    let publicationId = req.params.id;
    Publication.findById(publicationId, (err, publication) => {
        if (err) return res.status(500).send({
            message: 'Error devolver publicaccion'
        });
        if (!publication) return res.status(500).send({message: 'Error devolver publicaccion'});
        return res.status(200).send({
            publication
        })
    });
}

function deletePublication(req, res) {
    let publicationId = req.params.id;

    Publication.find({user: req.user.sub, '_id': publicationId}).remove((err) => {
        if (err) return res.status(500).send({
            message: 'No se ha borrado la publicacion'
        });
        // if(!publicationRemoved) return res.status(404).send({message:'No se ha borrado la publicacion'});
        return res.status(200).send({
            message: 'Publicacion elimindada'
        })
    });
}

// Subir archivos de imagen/Avatar de usuario
function uploadImage(req, res) {
    let publicationId = req.params.id;

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

        if (file_ext === 'png' || file_ext === 'jpg' || file_ext === 'jpeg' || file_ext === 'gif') {
            Publication.findOne({user: req.user.sub, '_id': publicationId}).exec((err, publication) => {
                if (publication) {
                    Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new: true}, (err, publicationUpdated) => {
                        if (err) return res.status(500).send({
                            message: 'Error en la peticion'
                        });
                        if (!publicationUpdated) return res.status(404).send({
                            message: 'No se ha podido actualizar el Usuario'
                        });
                        return res.status(200).send({
                            publication: publicationUpdated
                        });
                    });
                } else {
                    return removeFilesOfUploads(res, file_path, "No tienes permisos para actulizar esta publicacion");
                }
            });
            //acutualizar documento de usuario logueado

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

function getImageFile(req, res) {
    let image_file = req.params.imageFile;
    let path_file = './uploads/publications/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({
                message: 'No existe la imagen'
            });
        }
    });
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({
            message: message
        });
    });
}

module.exports = {
    test,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile,
    getUserPublications
};
