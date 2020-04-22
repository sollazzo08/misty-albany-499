var express = require('express');
var router = express.Router();
//const {auth} = require('./verifyToken');
//Import the Image schema 
const Image = require('../image/image.model');                  


//Retrieves the most recent image from the database
router.get('/', (req, res) => {
  Image.find().sort({"date": -1}).limit(1)
  .then(image => res.json(image))
});

//This is where the img is created and stored in database
router.post('/', function(req, res) {
  const newImage = new Image({
    url: req.body.url
  });
  newImage.save().then(image => res.json(image));
});

module.exports = router;