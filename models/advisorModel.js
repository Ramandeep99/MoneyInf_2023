const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Schema = mongoose.Schema

const advisorDetail = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    contactNo: {
        type: Number,
        required: [true, "Please enter a Number"],
        minlength: [4, "Minimum length is 10 characters"]
    },
    experience: {
        type: Number
    },
    about: {
        type: String
    },
    skills: {
        type: String
    },
    indices: [{
        type: String,
        unique: true
    }],
    sebi: {
        type: String,
        required: [true, "Uploaded file must have a name"],
    },
}, { timestamps: true })

// detailSchema.pre("save", async function(next) {
//     if (this.isModified("password")) {
//         this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
// })


const Detail = new mongoose.model('advisorDetail', advisorDetail)


module.exports = Detail;