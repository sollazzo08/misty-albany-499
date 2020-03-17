const staff = require('./staff.controller');

module.exports = (route) => {
    //Making a new staff
    route.post('/staff', staff.create);

    //Retrieving all staff from db
    //route.get('/staff', staff.findAll);

    //Retrieving a single staff from db
    //route.get('/staff/:s_id', staff.findOne);

    //Update a staff with a s_id
    route.put('/staff/:s_id', staff.update);

    //Deleting a staff
    route.delete('/staff/:s_id', staff.delete);
};