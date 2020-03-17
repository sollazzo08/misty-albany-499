// get dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// parse requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Enable CORS for all HTTP methods
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

const mongoose = require('mongoose');
const config = require('./config');
require('./resident/resident.routes.js')(app);

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log("Successfully connected to the database");    
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
});

// default route
app.get('/', (res) => {
    res.json({"message": "Welcome to Misty's Res/Staff Database"});
});

// listen on port 3000
app.listen(config.PORT, () => {
    console.log("Server is listening on port 1234");
});