const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var staffSchema = new Schema({
    id: Number,
    name: String,
    age: Number,
    dob: String,
    image: String,
    asleep: Boolean
});

module.exports = mongoose.model('Staff', StaffSchema)