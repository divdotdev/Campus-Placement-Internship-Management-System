const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isStudent } = require('../middleware/roleMiddleware');

// All student routes require authentication and student role
router.use(isAuthenticated, isStudent);

router.get('/dashboard', studentController.getDashboard);

router.get('/profile', studentController.getProfile);
router.post('/profile', studentController.updateProfile);

router.get('/drives', studentController.getDrives);
router.get('/drives/:id', studentController.getDriveDetail);
router.post('/drives/:id/apply', studentController.applyDrive);

router.get('/applications', studentController.getMyApplications);
router.get('/placement-status', studentController.getPlacementStatus);

module.exports = router;
