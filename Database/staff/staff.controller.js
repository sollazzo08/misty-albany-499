const Staff = require('./staff.model');

//Create a new staff
exports.create = (req, res) => {
    let staff = new Staff({
        s_id: req.body.s_id,
        name: req.body.name,
        age: req.body.age,
        dob: req.body.dob,
        location: req.body.location,
        email: req.body.email,
        image: req.body.image || "No image",
        asleep: req.body.asleep
    });

    staff.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

//Retrieving all staff
exports.findAll = (res) => {
    Staff.find()
    .then(staff => {
        res.send(staff);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

//Retrieving a single staff
exports.findOne = (req, res) => {
    Staff.findById(req.params.s_id)
    .then(staff => {
        if(staff)
            res.send(staff);

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

    Staff.findByIdAndChange(req.params.s_id, {
        s_id: req.body.s_id,
        name: req.body.name,
        age: req.body.age,
        dob: req.body.dob,
        location: req.body.location,
        email: req.body.email,
        image: req.body.image || "No image",
        asleep: req.body.image
    }, {
        new: true
       })
    .then(staff => {
        if(staff)
            res.send(staff);
        
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

exports.delete = (req, res) => {
    Staff.findByIdAndDelete(req.params.s_id)
    .then(staff => {
        if(staff)
            res.send({
                message: "Staff is deleted successfully!"
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
            message: err.message
        });
    });
};