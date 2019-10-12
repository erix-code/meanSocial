let express = require('express');
let bodyParser = require('body-parser');

let app = express();

//Load routes
let user_routes = require("./routes/User");
let follow_routes = require('./routes/Follow');
let publication_routes = require('./routes/Publication');
let message_routes = require('./routes/Message');
//Middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//Cors
// configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

//Routes
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

//Export
module.exports = app;
