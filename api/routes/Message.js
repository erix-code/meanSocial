let express = require('express');
let MessageController = require('../controllers/Message');
let api = express.Router();
let md_auth = require('../middlewares/authenticated');

api.get('/test-md',md_auth.ensureAuth,MessageController.test);
api.post('/message',md_auth.ensureAuth,MessageController.saveMessage);
api.get('/my-messages/:page?',md_auth.ensureAuth,MessageController.getReceivedMessages);
api.get('/messages/:page?',md_auth.ensureAuth,MessageController.getEmmitMessages);
api.get('/unviewed-messages',md_auth.ensureAuth,MessageController.getUnviewedMessages);
api.get('/set-viewed-messages',md_auth.ensureAuth,MessageController.setViewedMessages);
module.exports =  api;
