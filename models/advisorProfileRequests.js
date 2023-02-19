const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Schema = mongoose.Schema

const advisorR = new mongoose.Schema({
    details: {
        type: Schema.Types.Object
    },
    status: {
        // unseen, rejected
        type: String,
        default: 'unseen'
    }
}, { timestamps: true })


const advisorRequest = new mongoose.model('advisorRequests', advisorR)

module.exports = advisorRequest;