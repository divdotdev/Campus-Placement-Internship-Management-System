const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest } = require('../middleware/authMiddleware');

router.get('/login', isGuest, authController.getLogin);
router.post('/login', isGuest, authController.postLogin);

router.get('/register/student', isGuest, authController.getRegisterStudent);
router.post('/register/student', isGuest, authController.postRegisterStudent);

router.get('/register/recruiter', isGuest, authController.getRegisterRecruiter);
router.post('/register/recruiter', isGuest, authController.postRegisterRecruiter);

router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
