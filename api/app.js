let express = require('express');
let bodyParser = require('body-parser');

let app = express();

//Load routes
let user_routes = require("./routes/User");
let follow_routes = require('./routes/Follow');
//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//Cors

//Routes
app.use('/api',user_routes);
app.use('/api',follow_routes);

//Export
module.exports = app;