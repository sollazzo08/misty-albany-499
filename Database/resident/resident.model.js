const mongoose = require('mongoose');

const ResidentSchema = mongoose.Schema({
    r_id: Number,
    name: String,
    age: Number,
    dob: Number,
    location: String,
    image: String,
    condition: String,
    response: String
}, {
    timestamps: true
});

ResidentModel = mongoose.model('Resident', ResidentSchema);
module.exports = ResidentModel;