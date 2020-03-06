const mongoose = require('mongoose');

var resSchema = mongoose.Schema({
    id: Number,
    name: String, 
    age: Number,
    dob: String,
    location: String,
    image: String,
    conditions: String,
    response: String
});
