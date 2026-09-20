const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isRecruiter } = require('../middleware/roleMiddleware');

// All recruiter routes require authentication and recruiter role
router.use(isAuthenticated, isRecruiter);

router.get('/dashboard', recruiterController.getDashboard);

router.get('/profile', recruiterController.getProfile);
router.post('/profile', recruiterController.updateProfile);

router.get('/drives', recruiterController.getMyDrives);
router.get('/drives/create', recruiterController.getCreateDrive);
router.post('/drives/create', recruiterController.postCreateDrive);

router.get('/drives/:id/applicants', recruiterController.getDriveApplicants);
router.post('/drives/:id/applicants/status', recruiterController.updateApplicantStatus);

module.exports = router;
