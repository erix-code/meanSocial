let express = require('express');
let UserController = require('../controllers/User');

let api = express.Router();

api.get('/home',UserController.home);
api.get('/tests',UserController.tests);
api.post('/register',UserController.saveUser);

module.exports = api;