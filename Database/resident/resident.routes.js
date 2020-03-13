const resident = require('./resident.controller');

module.exports = (app) => {
    //Making a new resident
    app.post('/resident', resident.create);

    //Retrieving all residents from db
    //app.get('/resident', resident.findAll);

    //Retrieving a single resident from db
    //app.get('/resident/:r_id', resident.findOne);

    //Update a resident with a r_id
    app.put('/resident/:r_id', resident.update);

    //Deleting a resident
    app.delete('/resident/:r_id', resident.delete);
}

/**
 * Note: We will decide later whether to list all the 
 * rows in the homepage, or if we will just do a findOne().
 */