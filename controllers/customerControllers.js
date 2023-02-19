require('dotenv').config();

const express = require("express");
const path = require('path')
const jwtoken = require('jsonwebtoken');
const Details = require('./../models/customerModel');
const bcrypt = require("bcryptjs");
// const { errorMonitor } = require("events");
// const { use } = require("../routes/advisorRoutes");s
const Admin = require('./../models/adminModel')
const app = express()

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


const crypto = require('crypto');
const smsKey = process.env.SMS_SECRET_KEY;
const twilioNum = process.env.TWILIO_PHONE_NUMBER;
const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN
const jwt = require('jsonwebtoken');
let refreshTokens = [];


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './../templates/views'))


module.exports.login_get = (req, res) => {
    res.render('customerLogin');
}

module.exports.register_get = (req, res) => {
    res.render('customerRegister');
}

module.exports.customerSendOTP = async(req, res) => {

    const phone = req.body.contact;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const ttl = 20 * 60 * 1000;
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;
    console.log(phone)
    client.messages
        .create({
            body: `Your One Time Login Password For CFM is ${otp}`,
            from: twilioNum,
            to: "+918930176068"
        })
        .then((messages) => console.log(messages))
        .catch((err) => console.error(err));

    res.status(200).render('customerOTP', { phone, hash: fullHash, otp }); // this bypass otp via api only for development instead hitting twilio api all the time
    // res.status(200).send({ phone, hash: fullHash });          // Use this way in Production
};


module.exports.customerVerifyOTP = async(req, res) => {
    const phone = req.body.phone;
    const hash = req.body.hash;
    const otp = req.body.otp;
    console.log(phone, hash, otp)
    let [hashValue, expires] = hash.split('.');

    let now = Date.now();
    if (now > parseInt(expires)) {
        return res.status(504).send({ msg: 'Timeout. Please try again' });
    }
    let data = `${phone}.${otp}.${expires}`;
    let newCalculatedHash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
    if (newCalculatedHash === hashValue) {

        const customer = await Details.findOne({ contactNo: phone })


        console.log('Customer confirmed');
        const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, { expiresIn: '1000s' }); // this much time 
        const refreshToken = jwt.sign({ data: phone }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
        refreshTokens.push(refreshToken);

        if (customer) {
            res
                .status(202)
                .cookie('accessToken', accessToken, {
                    expires: new Date(new Date().getTime() + 30 * 60 * 1000),
                    sameSite: 'strict',
                    httpOnly: true
                })
                .cookie('refreshToken', refreshToken, {
                    expires: new Date(new Date().getTime() + 31557600000),
                    sameSite: 'strict',
                    httpOnly: true
                })
                .cookie('authSession', true, { expires: new Date(new Date().getTime() + 30 * 1000), sameSite: 'strict' })
                .cookie('refreshTokenID', true, {
                    expires: new Date(new Date().getTime() + 31557600000),
                    sameSite: 'strict'
                })
                .send({ msg: 'customerFound' });
        } else {
            res
                .status(202)
                .cookie('accessToken', accessToken, {
                    expires: new Date(new Date().getTime() + 30 * 60 * 1000),
                    sameSite: 'strict',
                    httpOnly: true
                })
                .cookie('refreshToken', refreshToken, {
                    expires: new Date(new Date().getTime() + 31557600000),
                    sameSite: 'strict',
                    httpOnly: true
                })
                .cookie('authSession', true, { expires: new Date(new Date().getTime() + 30 * 1000), sameSite: 'strict' })
                .cookie('refreshTokenID', true, {
                    expires: new Date(new Date().getTime() + 31557600000),
                    sameSite: 'strict'
                })
                .send({ msg: 'customerNotFound' });
        }


    } else {
        console.log('not authenticated');
        return res.status(400).send({ verification: false, msg: 'Incorrect OTP' });
    }
};


// module.exports.profile_get = async(req, res) => {
//     const phone = req.phone.data
//     console.log(phone)
//     const advisorP = await Details.findOne({ contactNo: phone })
//     console.log(advisorP)

//     res.render('advisorProfile', { advisor: advisorP });
// }



module.exports.register_post = async(req, res) => {

    try {
        const detail = new Details({
            name: req.body.name,
            email: req.body.email,
            contactNo: req.body.contact,
        })
        console.log(detail)
        const registered = await detail.save();
        console.log(registered)
        res.status(201).json({ registered: registered._id })
    } catch (error) {
        console.log(error)
        res.send({ error });
    }
}

module.exports.dashboard_get = (req, res) => {
    res.render('customerDashboard');
}


module.exports.logout_get = (req, res) => {
    res
        .clearCookie('refreshToken')
        .clearCookie('accessToken')
        .clearCookie('authSession')
        .clearCookie('refreshTokenID')
        .redirect('/user')
}


// module.exports.updateProfile_post = async(req, res) => {
//     const name = req.body.name
//     const phone = req.body.phone
//     const email = req.body.email
//     const skills = req.body.skills
//     const experience = req.body.experience
//     const about = req.body.about
//         // console.log(name, phone, email, skills, experience, about)

//     const oldPhone = req.phone.data
//         // console.log(phone)
//     const advisorP = await Details.findOne({ contactNo: oldPhone })
//     advisorP.name = name
//     advisorP.phone = phone
//     advisorP.email = email
//     advisorP.skills = skills
//     advisorP.experience = experience
//     advisorP.about = about

//     const registered = await advisorP.save();
//     // console.log(registered)
//     res.render('advisorProfile', { advisor: advisorP });
// }

// module.exports.updateProfile = async(req, res) => {
//     const phone = req.phone.data
//         // console.log(phone)
//     const advisorP = await Details.findOne({ contactNo: phone })
//         // console.log(advisorP)
//     res.render('advisorUpdateProfile', { advisor: advisorP });
// }

// module.exports.advisorIndices = async(req, res) => {
//     res.render('indices&sebiCerti.ejs');
// }

// module.exports.advisorIndices_post = async(req, res) => {
//     // console.log(req.body.intraday)
//     // console.log(req.body.future == '')
//     const phone = req.phone.data
//         // console.log(phone)
//     const advisorP = await Details.findOne({ contactNo: phone })
//     console.log(advisorP)
//     if (req.body.intraday == '') await advisorP.indices.addToSet('intraday');
//     if (req.body.swing == '') await advisorP.indices.addToSet('swing');
//     if (req.body.future == '') await advisorP.indices.addToSet('future');
//     const registered = await advisorP.save();
//     console.log(registered)
//     res.render('advisorProfile', { advisor: advisorP });
// }


// module.exports.uploadSebi_post = async(req, res) => {
//     const phone = req.phone.data
//         // console.log(phone)
//     const advisorP = await Details.findOne({ contactNo: phone })
//         // console.log(req.body.sebiCerti)
//     advisorP.sebi = req.file.filename
//     const registered = await advisorP.save();
//     console.log(registered)
//     res.render('advisorProfile', { advisor: advisorP });
// }

// module.exports.submitProfile = async(req, res) => {
//     // console.log("reached")
//     const phone = req.phone.data
//     const advisorP = await Details.findOne({ contactNo: phone })
//     const curr = await advisorRequest.findOne({
//         details: advisorP
//     })

//     if (curr != null) {
//         return res.render('advisorDashboard');
//     }

//     const xyz = new advisorRequest()
//     xyz.details = advisorP;
//     const res_ = await xyz.save();
//     res.render('advisorDashboard');
// }