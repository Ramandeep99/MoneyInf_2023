const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Schema = mongoose.Schema

const advisorA = new mongoose.Schema({
    acceptedDetails: {
        type: Schema.Types.Object
    }
}, { timestamps: true })


const advisorAccept = new mongoose.model('advisorAccepted', advisorA)

module.exports = advisorAccept;