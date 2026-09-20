const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/students', adminController.getStudents);

router.get('/drives', adminController.getDrives);
router.get('/drives/create', adminController.getCreateDrive);
router.post('/drives/create', adminController.postCreateDrive);

router.get('/drives/:id/edit', adminController.getEditDrive);
router.post('/drives/:id/edit', adminController.postEditDrive);
router.post('/drives/:id/delete', adminController.deleteDrive);

router.get('/drives/:id/applicants', adminController.getDriveApplicants);
router.post('/drives/:id/applicants/status', adminController.updateApplicantStatus);
router.post('/drives/:id/auto-shortlist', adminController.autoShortlistEligible);

router.get('/analytics', adminController.getAnalytics);

module.exports = router;
