const express = require("express");
const advisorController = require('../controllers/customerControllers');
// const other_user_profile_controllers = require('../controllers/user_controllers');
// const { requireAuth, currentUser, userName } = require('./../middleware/login_signup_mw');
// const { authenticateAdvisor } = require('./../middlewares/advisorMiddlewares')
const router = express.Router();

// const multer = require("multer");


router.get('/', advisorController.login_get);

router.post('/', advisorController.advisorSendOTP);

// router.post('/verifyOTP', advisorController.advisorVerifyOTP)

// router.get('/advisorRegister', authenticateAdvisor, advisorController.register_get);

// router.post('/advisorRegister', authenticateAdvisor, advisorController.register_post);

// router.get('/dashboard', authenticateAdvisor, advisorController.dashboard_get);

// router.get('/logout', authenticateAdvisor, advisorController.logout_get);

module.exports = router