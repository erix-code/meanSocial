let express = require('express');
let UserController = require('../controllers/User');
let api = express.Router();
let md_auth = require('../middlewares/authenticated');

api.get('/home',UserController.home);
api.get('/tests',md_auth.ensureAuth,UserController.tests);
api.post('/register',UserController.saveUser);
api.post('/login',UserController.loginUser);
api.get('/user/:id',md_auth.ensureAuth,UserController.getUser);
api.get('/users/:page?',md_auth.ensureAuth,UserController.getUsers);

module.exports = api;