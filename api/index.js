let mongoose = require('mongoose');
let app = require('./app');
let port = 3800;

//Connect to the database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mean-social',{useNewUrlParser: true})
    .then(() =>{
        console.log("Hi sir Successful connection to the database ")

        //Create the server
        app.listen(port,()=>{
            console.log("Server running in" + port)
        })
    })
    .catch(error => console.log(error));
