const Resident = require('./resident.model');

//Create a new resident
exports.create = (req, res) => {
    const resident = new Resident({
        r_id: req.body.r_id,
        name: req.body.name,
        age: req.body.age,
        dob: req.body.dob,
        location: req.body.location,
        image: req.body.image || "No image",
        condition: req.body.condition,
        response: req.body.response || "No responses"
    });

    resident.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

//Retrieving all residents 
exports.findAll = (req, res) => {
    Resident.find()
    .then(resident => {
        res.send(residents);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

//Retrieving a single resident
exports.findOne = (req, res) => {
    Resident.findById(req.params.r_id)
    .then(resident => {
        if(resident)
            res.send(resident);

        return res.status(404).send({
            message: err.message
        });
    })
    .catch(err => {
        if(err.kind === 'ObjectId'){
            return res.status(404).send({
                message: err.message
            });
        }
        return res.status(500).send({
            message: err.message
        });
    });
};

exports.update = (req, res) => {
    if(!req.body){
        return res.status(400).send({
            message: err.message
        });
    }

    Resident.findByIdAndChange(req.params.r_id, {
        r_id: req.body.r_id,
        name: req.body.name,
        age: req.body.age,
        dob: req.body.dob,
        location: req.body.location,
        image: req.body.image || "No image",
        condition: req.body.condition,
        response: req.body.response || "No responses"
    }, {new: true})
    .then(resident => {
        if(resident)
            res.send(resident);
        
        return res.status(404).send({
            message: "Resident not found with id " + r_id
        });
    })
    .catch(err => {
        if(err.kind === 'ObjectId'){
            return res.status(404).send({
                message: "Product not found with id " + req.params.productId
            });
        }
        return res.status(500).send({
            message: err.message
        });
    });
};

exports.delete = (req, res) => {
    Resident.findByIdAndDelete(req.params.r_id)
    .then(resident => {
        if(resident)
            res.send({
                message: "Resident is deleted successfully!"
            });

        return res.status(404).send({
            message: err.message
        }); 
    })
    .catch(err => {
        if(err.kind === 'ObjectId'){
            return res.status(404).send({
                message: err.message
            });
        }
        return res.status(500).send({
            message: "Could not delete resident with id " + r_id
        });
    });
};