/*********************************************************
 *  This file is used as the backend to our User Inteface. This serves as the schema of our database. 
 * 
 *  We were helped by this article to help us understand Rest API routes and interacting them with MongoDB:
 *      https://bezkoder.com/node-express-mongodb-crud-rest-api/
 * 
 *  Note: For our project, image and response are not being used. 
 * 
 **********************************************************/

const mongoose = require('mongoose');

const ResidentSchema = mongoose.Schema({
    r_id: Number,
    name: String, //can use trim here
    age: Number,
    dob: Number,
    location: String,
    image: String,
    condition: String,
    response: String
    }, 
    {
        timestamps: true
    });

ResidentModel = mongoose.model('Resident', ResidentSchema);
module.exports = ResidentModel;