const mongoose = require('mongoose');

const staffSchema = mongoose.Schema({
    s_id: Number,
    name: String,
    age: Number,
    dob: Number,
    location: Number,
    email: String,
    image: String,
    asleep: Boolean
    },
    {
        timestamp: true
    });

StaffModel = mongoose.model('Staff', staffSchema);
module.exports = StaffModel;