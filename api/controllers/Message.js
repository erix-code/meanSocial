let moment = require('moment');
let mongoosePaginate = require('mongoose-pagination');
let User = require('../models/User');
let Follow = require('../models/Follow');
let Message = require('../models/Message');

function test(req, res) {
    res.status(200).send({
        message: 'Hola desde el controlador de mensajes'
    });
}

function saveMessage(req, res) {
    let params = req.body;
    if (!params.text || !params.receiver) {
        res.status(200).send({
            message: 'Envia los datos nescesarios'
        });
    }
    let message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';
    message.save((err,messageStored)=>{
        if (err) return res.status(200).send({
            message: "Error en la peticion"
        });
        if (!messageStored) return res.status(200).send({
            message: "Error al enviar el mensaje"
        });
        return res.status(200).send({
            message: messageStored
        });
    });


}
function getReceivedMessages(req,res){
    let userId = req.user.sub;
    let page = 1;
    if (req.params.page){
        page = req.params.page;
    }
    let itemsPerPage = 4;
    Message.find({receiver: userId}).populate('emitter','name surname image nick _id')
        .sort('-created_at')
        .paginate(page,itemsPerPage,(err,messages,total)=>{
        if (err) return res.status(200).send({
            message: "Error en la peticion"
        });
        if (!messages) return res.status(404).send({
            message: "No hay mensajes"
        });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}
function getEmmitMessages(req,res){
    let userId = req.user.sub;
    let page = 1;
    if (req.params.page){
        page = req.params.page;
    }
    let itemsPerPage = 4;
    Message.find({emitter: userId}).populate('emitter receiver','name surname image nick _id')
        .sort('-created_at')
        .paginate(page,itemsPerPage,(err,messages,total)=>{
        if (err) return res.status(200).send({
            message: "Error en la peticion"
        });
        if (!messages) return res.status(404).send({
            message: "No hay mensajes"
        });
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}
function getUnviewedMessages(req,res){
    let userId = req.user.sub;
    Message.count({
        receiver: userId,
        viewed: 'false'
    }).exec((err,count)=>{
        if (err) return res.status(200).send({
            message: "Error en la peticion"
        });
        return res.status(200).send({
            'unviewed' : count
        })
    })
}
function setViewedMessages(req,res){
    let userId = req.user.sub;
    Message.update({receiver:userId,viewed: 'false'},{viewed:'true'},{multi:true},(err,messagesUpdated)=>{
        if (err) return res.status(200).send({
            message: "Error en la peticion"
        });
        return res.status(200).send({
                messages: messagesUpdated
            });
    });
}
module.exports = {
    test,
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages
}
