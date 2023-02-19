const express = require("express");
const advisorController = require('../controllers/advisorControllers');
// const other_user_profile_controllers = require('../controllers/user_controllers');
// const { requireAuth, currentUser, userName } = require('./../middleware/login_signup_mw');
const { authenticateAdvisor } = require('./../middlewares/advisorMiddlewares')
const router = express.Router();

const multer = require("multer");


router.get('/', advisorController.login_get);

router.post('/', advisorController.advisorSendOTP);

router.post('/verifyOTP', advisorController.advisorVerifyOTP)

router.get('/advisorRegister', authenticateAdvisor, advisorController.register_get);

router.post('/advisorRegister', authenticateAdvisor, advisorController.register_post);

router.get('/dashboard', authenticateAdvisor, advisorController.dashboard_get);

router.get('/logout', authenticateAdvisor, advisorController.logout_get);

router.get('/profile', authenticateAdvisor, advisorController.profile_get);

router.get('/updateProfile', authenticateAdvisor, advisorController.updateProfile)

router.post('/updateProfile', authenticateAdvisor, advisorController.updateProfile_post)

router.get('/advisorIndices', authenticateAdvisor, advisorController.advisorIndices)

router.post('/advisorIndices', authenticateAdvisor, advisorController.advisorIndices_post)


const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "MyFiles");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `files/${file.originalname}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true);
    } else {
        cb(new Error("Not a PDF File!!"), false);
    }
};


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

router.post('/uploadSebi', authenticateAdvisor, upload.single("myfile"), advisorController.uploadSebi_post)

const fs = require('fs');
router.get("/download/files/:fileName", authenticateAdvisor, async(req, res) => {
    // console.log("Hello guyss");
    // console.log(__dirname)
    var fileName = req.params.fileName;
    // console.log(fileName)
    const file = fs.createReadStream(`./MyFiles/files/${fileName}`);
    const stat = fs.statSync(`./MyFiles/files/${fileName}`);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    file.pipe(res);
})


// submit the profile to admin
router.post('/submitProfile', authenticateAdvisor, advisorController.submitProfile);


module.exports = router