const express = require("express");
const customerController = require('../controllers/customerControllers');
// const other_user_profile_controllers = require('../controllers/user_controllers');
// const { requireAuth, currentUser, userName } = require('./../middleware/login_signup_mw');
const { authenticateCustomer } = require('./../middlewares/customerMiddlewares')
const router = express.Router();

// const multer = require("multer");


router.get('/', customerController.login_get);

router.post('/', customerController.customerSendOTP);

router.post('/verifyOTP', customerController.customerVerifyOTP)

router.get('/customerRegister', authenticateCustomer, customerController.register_get);

router.post('/customerRegister', authenticateCustomer, customerController.register_post);

router.get('/dashboard', authenticateCustomer, customerController.dashboard_get);

router.get('/logout', authenticateCustomer, customerController.logout_get);

module.exports = router