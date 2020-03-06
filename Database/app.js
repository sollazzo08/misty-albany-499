const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')

const resident = require('./models/resident')
const staff = require('./models/staff')

const app = express()

require('dotenv').config()

const mongouri = process.env.MONGO_URI
mongoose.connect(mongouri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected!"))
.catch((err) => console.log(err));