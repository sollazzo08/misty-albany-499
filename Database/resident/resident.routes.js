
const express = require('express');
const resident = require('./resident.controller');

//onst router = express.Router();

//const Resident = require('./resident.model');
module.exports = (route) => {
    
    //Making a new resident
    route.post('/resident', resident.create);

    //Retrieving all residents from db
    //route.get('/resident', resident.findAll);

    //Retrieving a single resident from db
    route.get('/resident/:id', resident.findById);

  

    //Update a resident with a r_id
    route.put('/resident/:r_id', resident.update);

    //Deleting a resident
    route.delete('/resident/:r_id', resident.delete);
}

/**
 * Note: We will decide later whether to list all the 
 * rows in the homepage, or if we will just do a findOne().
 */

 //module.exports = router;