const express = require("express");
const adminControllers = require('../controllers/adminController');
// const other_user_profile_controllers = require('../controllers/user_controllers');
// const { requireAuth, currentUser, userName } = require('./../middleware/login_signup_mw');
const { authenticateAdmin } = require('./../middlewares/adminMiddlewares')
const router = express.Router();



router.get('/', adminControllers.login_get);

router.post('/', adminControllers.adminSendOTP);

router.post('/verifyOTP', adminControllers.adminVerifyOTP)

router.get('/adminRegister', authenticateAdmin, adminControllers.register_get);

// router.get('/login', authcontrollers.login_get);

router.post('/adminRegister', authenticateAdmin, adminControllers.register_post);

router.get('/dashboard', authenticateAdmin, adminControllers.dashboard_get);

router.get('/advisorRequests', authenticateAdmin, adminControllers.advisorProfile_get)

router.get('/advisorCompleteProfile/:id', authenticateAdmin, adminControllers.advisorCompleteProfile_get);

router.get('/acceptedAdvisor/:id', authenticateAdmin, adminControllers.acceptedAdviosr_get);

router.get('/rejectedAdvisor/:id', authenticateAdmin, adminControllers.rejectedAdviosr_get);

// router.get('/logout',currentUser, authcontrollers.logout_get);

// router.get('/profile',currentUser, authcontrollers.profile_get);

// router.get('/other_profile/:id' ,currentUser, other_user_profile_controllers.other_profile_get);

// router.put('/follow/:id' , currentUser, other_user_profile_controllers.follow_put);

// router.get('/bookmark' , currentUser, other_user_profile_controllers.bookmark_get);

// router.put('/bookmark/:id' , currentUser, other_user_profile_controllers.bookmark_put);

module.exports = router