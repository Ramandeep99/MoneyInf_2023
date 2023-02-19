// module.exports.addHashContact = (req,res,next) => {
//     res.locals.phone = req.body.phone
// }


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

const authenticateCustomer = (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    jwt.verify(accessToken, JWT_AUTH_TOKEN, async(err, phone) => {
        if (phone) {
            req.phone = phone;
            // console.log(phone)
            next();
        } else if (err.message === 'TokenExpiredError') {
            return res.redirect('/user')
            return res.status(403).send({
                success: false,
                msg: 'Access token expired'
            });
        } else {
            console.log(err);
            return res.redirect('/user')
            return res.status(403).send({ err, msg: 'Advisor not authenticated' });
        }
    });
}



module.exports = { authenticateCustomer }