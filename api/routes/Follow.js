let express = require('express');
let FollowController = require('../controllers/Follow');
let api = express.Router();
let md_auth = require('../middlewares/authenticated');

api.post('/follow',md_auth.ensureAuth,FollowController.saveFollow);
api.delete('/follow/:id',md_auth.ensureAuth,FollowController.deleteFollow)
module.exports = api;