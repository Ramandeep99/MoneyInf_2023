require('dotenv').config();

const express = require("express");
const path = require('path')
const jwtoken = require('jsonwebtoken');
const Details = require('./../models/adminModel');
const bcrypt = require("bcryptjs");
// const { errorMonitor } = require("events");
const { use } = require("../routes/adminRoutes");
// const Article = require('./../models/article')
const app = express()
const advisorRequest = require('./../models/advisorProfileRequests')
const advisorAccept = require('./../models/advisorAcceptedReq')
const Adviosr = require('./../models/advisorModel')

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
    res.render('adminLogin');
}

module.exports.register_get = (req, res) => {
    res.render('adminRegister');
}

module.exports.adminSendOTP = async(req, res) => {

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

    res.status(200).render('adminOTP', { phone, hash: fullHash, otp }); // this bypass otp via api only for development instead hitting twilio api all the time
    // res.status(200).send({ phone, hash: fullHash });          // Use this way in Production
};


module.exports.adminVerifyOTP = async(req, res) => {
    const phone = req.body.phone;
    const hash = req.body.hash;
    const otp = req.body.otp;
    console.log(phone)
    let [hashValue, expires] = hash.split('.');
    let now = Date.now();
    if (now > parseInt(expires)) {
        return res.status(504).send({ msg: 'Timeout. Please try again' });
    }
    let data = `${phone}.${otp}.${expires}`;
    let newCalculatedHash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
    if (newCalculatedHash === hashValue) {
        console.log('user confirmed');
        const accessToken = jwt.sign({ data: phone }, JWT_AUTH_TOKEN, { expiresIn: '1000s' }); // this much time 
        const refreshToken = jwt.sign({ data: phone }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
        refreshTokens.push(refreshToken);
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
            .send({ msg: 'Device verified' });
    } else {
        console.log('not authenticated');
        return res.status(400).send({ verification: false, msg: 'Incorrect OTP' });
    }
};



// module.exports.profile_get = async (req, res) => {

//     const articles = await Article.find().sort({ createdAt: 'desc' })

//     // total posts by logged in user
//     const totalPosts = await Article.find({ createdById: res.locals.user._id })

//     res.render('profile', { articles: articles, totalPosts: totalPosts });
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
    res.render('adminDashboard');
}

module.exports.advisorProfile_get = async(req, res) => {
    const allProfiles = await advisorRequest.find({})
    console.log(allProfiles)
    res.render("advisorRequests", { profiles: allProfiles });
}


module.exports.advisorCompleteProfile_get = async(req, res) => {
    const advisorP = await Adviosr.findById(req.params.id);
    res.render('advidorProfileViewAdmin', { advisor: advisorP })
}

module.exports.acceptedAdviosr_get = async(req, res) => {
    const advisorP = await Adviosr.findById(req.params.id);
    // deleted accepted advisor
    // var allProfiles = await advisorRequest.find({})
    // var toDeleteAdvisor;
    // allProfiles.forEach(profile => {
    //     if (profile.details._id == req.params.id) {
    //         toDeleteAdvisor = profile._id;
    //     }
    // });

    // await advisorRequest.deleteOne({ _id: toDeleteAdvisor })

    const xyz = new advisorAccept()
    xyz.acceptedDetails = advisorP;
    const res_ = await xyz.save();
    allProfiles = await advisorRequest.find({})
    res.render("advisorRequests", { profiles: allProfiles });
}

module.exports.rejectedAdviosr_get = async(req, res) => {
    const advisorP = await Adviosr.findById(req.params.id);
    // deleted accepted advisor
    var allProfiles = await advisorRequest.find({})
    var toRejectAdvisorId;
    allProfiles.forEach(profile => {
        if (profile.details._id == req.params.id) {
            toRejectAdvisorId = profile._id;
        }
    });

    const toRejectAdvisor = await advisorRequest.findOne({ _id: toRejectAdvisorId })
    toRejectAdvisor.status = 'Rejected';

    const res_ = await toRejectAdvisor.save();
    allProfiles = await advisorRequest.find({})
    arr = [];
    allProfiles.forEach(p => {
        if (p.status == 'unseen') {
            arr.push(p);
        }
    })
    res.render("advisorRequests", { profiles: arr });
}


// module.exports.login_post = async (req, res) => {
//     try {
//         const email = req.body.email;
//         const password = req.body.password;

//         const userData = await Details.findOne({ email: email });

//         if (userData) {
//             const isMatch = await bcrypt.compare(password, userData.password);

//             // generating jwt at login 
//             const token = await userData.generateAuthToken();

//             // storing cookies
//             // var maxTime = 10 * 60 * 60 //  not worked because variable name for cookie must be maxAge
//             // var maxAge = 1 * 60 * 60 *1000
//             res.cookie("jwtoken", token, {
//                 // expires: new Date(Date.now() + maxAge),
//                 // expiresIn: maxTime*1000,
//                 httpOnly: true
//             })

//             if (isMatch) {
//                 res.status(200).json({ userData: userData._id });
//             }
//             else {
//                 res.json({ "password": "Invalid password" });
//             }
//         }
//         else {
//             res.json({ 'email': 'Invalid Email' })
//         }
//     }
//     catch (error) {
//         handleErrors(error);
//         res.status(400).json({ error })
//     }
// }


// module.exports.logout_get = async (req, res) => {

//     try {

//         res.locals.user.tokens = res.locals.user.tokens.filter(currEle =>{
//             return currEle.token != req.token;
//         })

//         res.clearCookie('jwtoken' ,{
//             expires: new Date(Date.now() +1),
//         });

//         await res.locals.user.save();
//         res.redirect('/login_signup/login')
//     }
//     catch (error) {
//         console.log(error)
//         res.status(500).send(error);
//     }
// }