const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema of the images stored in database
const ImageSchema = new Schema ({
      url: {
        type: String,
        required: true
      },
      desc: {
        type: String,
        required: false
      },
      date: {
        type: Date,
        default: Date.now
      }
})

module.exports = mongoose.model('Image', ImageSchema);