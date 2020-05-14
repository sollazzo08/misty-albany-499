/*********************************************************
 *  This file is used as the backend to our User Inteface. Theses are the REST API routes that are going to be
 *  used to CREATE and READ the resident information off our database.
 * 
 *  We were helped by this article to help us understand Rest API routes and interacting them with MongoDB:
 *      https://bezkoder.com/node-express-mongodb-crud-rest-api/
 * 
 **********************************************************/

const resident = require('./resident.controller');
const Resident = require('./resident.model');
//onst router = express.Router();

//const Resident = require('./resident.model');
module.exports = (route) => {
    
    //Making a new resident
    route.post('/resident', resident.create);

    //Retrieving all residents from db
    //route.get('/resident', resident.findAll);

    //Retrieving a single resident from db
  //  route.get('/resident/:id', resident.findById);

    route.get('/resident/',
    
    function(req,res){
        var name = req.query.name;
        Resident.find({name: name})
        .then(resident => {
            if(resident)
                res.send(resident);
            
            return res.status(404).send({
                message: "Resident not found with name" + r_id
            });
        })
            .catch(err => res.status(404).json({success: false}))
        }   
    );
/*
    router.route("/getData").get(function(req, res) {
        kennels.find({}, function(err, result) {
          if (err) {
            res.send(err);
          } else {
            res.send(result);
          }
        });
      });
*/
    //Update a resident with a r_id
 //   route.put('/resident/:r_id', resident.update);

    //Deleting a resident
 //   route.delete('/resident/:r_id', resident.delete);
}

/**
 * Note: We will decide later whether to list all the 
 * rows in the homepage, or if we will just do a findOne().
 */

 //module.exports = router;