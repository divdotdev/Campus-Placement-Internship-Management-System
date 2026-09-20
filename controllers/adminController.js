const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const { checkEligibility } = require('../utils/eligibilityChecker');

// Admin Dashboard Overview with Analytics & Chart Data
exports.getDashboard = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const activeDrives = await Drive.countDocuments({ status: 'Active' });
    const totalApplications = await Application.countDocuments();
    const placedStudents = await StudentProfile.countDocuments({ isPlaced: true });
    const unplacedStudents = Math.max(0, totalStudents - placedStudents);
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

    // Branch-wise placement statistics aggregation
    const branchStats = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$branch',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$isPlaced', true] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Company-wise placements aggregation (selected offers)
    const companyStats = await Application.aggregate([
      { $match: { status: 'Selected' } },
      {
        $group: {
          _id: '$companyName',
          selections: { $sum: 1 }
        }
      },
      { $sort: { selections: -1 } },
      { $limit: 8 }
    ]);

    // Recent drives
    const recentDrives = await Drive.find().sort({ createdAt: -1 }).limit(5);

    // Recent applications
    const recentApplications = await Application.find()
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('drive', 'role companyName type')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recently selected students
    const recentlyPlaced = await Application.find({ status: 'Selected' })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('drive', 'role companyName package')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard | Placement Cell',
      stats: {
        totalStudents,
        activeDrives,
        totalApplications,
        placedStudents,
        unplacedStudents,
        placementRate
      },
      branchStats,
      companyStats,
      recentDrives,
      recentApplications,
      recentlyPlaced
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.flash('error_msg', 'Could not load administrative dashboard.');
    res.redirect('/');
  }
};

// View & Filter Registered Students
exports.getStudents = async (req, res) => {
  try {
    const { search, branch, placementStatus } = req.query;

    const filter = {};
    if (branch && branch !== 'All') {
      filter.branch = branch;
    }
    if (placementStatus === 'placed') {
      filter.isPlaced = true;
    } else if (placementStatus === 'unplaced') {
      filter.isPlaced = false;
    }

    let profiles = await StudentProfile.find(filter).populate('user').sort({ rollNumber: 1 });

    // Client-side search for student name or rollNumber
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      profiles = profiles.filter((p) => {
        const studentName = p.user ? p.user.name.toLowerCase() : '';
        const roll = p.rollNumber.toLowerCase();
        return studentName.includes(q) || roll.includes(q);
      });
    }

    res.render('admin/students', {
      pageTitle: 'Student Directory | Placement Cell',
      students: profiles,
      filters: {
        search: search || '',
        branch: branch || 'All',
        placementStatus: placementStatus || 'all'
      }
    });
  } catch (error) {
    console.error('Admin students list error:', error);
    req.flash('error_msg', 'Unable to retrieve students.');
    res.redirect('/admin/dashboard');
  }
};

// Drive Management Table
exports.getDrives = async (req, res) => {
  try {
    const drives = await Drive.find().sort({ createdAt: -1 });

    // Attach applicant count to each drive
    const driveCards = await Promise.all(
      drives.map(async (drive) => {
        const applicantCount = await Application.countDocuments({ drive: drive._id });
        return {
          ...drive.toObject(),
          applicantCount
        };
      })
    );

    res.render('admin/drives', {
      pageTitle: 'Placement & Internship Drives | Placement Cell',
      drives: driveCards
    });
  } catch (error) {
    console.error('Admin drives list error:', error);
    req.flash('error_msg', 'Could not retrieve drive records.');
    res.redirect('/admin/dashboard');
  }
};

// Form to Create New Drive
exports.getCreateDrive = async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.render('admin/driveCreate', {
      pageTitle: 'Create Placement Drive | Placement Cell',
      companies
    });
  } catch (error) {
    console.error('Get create drive error:', error);
    res.redirect('/admin/drives');
  }
};

// Handle New Drive Submission
exports.postCreateDrive = async (req, res) => {
  try {
    const {
      companyName,
      companyLogoUrl,
      type,
      role,
      description,
      package: pkg,
      stipend,
      location,
      workMode,
      minCGPA,
      eligibleBranches,
      graduationYear,
      maxBacklogs,
      requiredSkills,
      applicationDeadline,
      driveDate,
      openings,
      companyWebsite
    } = req.body;

    const branchesArray = Array.isArray(eligibleBranches)
      ? eligibleBranches
      : (eligibleBranches || 'CSE,IT').split(',').map((b) => b.trim()).filter(Boolean);

    const skillsArray = requiredSkills
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const drive = new Drive({
      companyName: companyName.trim(),
      companyLogoUrl: companyLogoUrl ? companyLogoUrl.trim() : '',
      type: type || 'Placement',
      role: role.trim(),
      description: description.trim(),
      package: pkg ? pkg.trim() : '',
      stipend: stipend ? stipend.trim() : '',
      location: location.trim(),
      workMode: workMode || 'On-site',
      minCGPA: parseFloat(minCGPA) || 6.0,
      eligibleBranches: branchesArray,
      graduationYear: parseInt(graduationYear, 10) || 2026,
      maxBacklogs: parseInt(maxBacklogs, 10) || 0,
      requiredSkills: skillsArray,
      applicationDeadline: new Date(applicationDeadline),
      driveDate: driveDate ? new Date(driveDate) : null,
      openings: parseInt(openings, 10) || 5,
      companyWebsite: companyWebsite ? companyWebsite.trim() : '',
      status: 'Active',
      createdBy: req.session.user.id
    });

    await drive.save();

    req.flash('success_msg', `Drive for ${drive.companyName} created successfully!`);
    res.redirect('/admin/drives');
  } catch (error) {
    console.error('Create drive error:', error);
    req.flash('error_msg', 'Failed to create drive. Check all required fields.');
    res.redirect('/admin/drives/create');
  }
};

// Form to Edit Existing Drive
exports.getEditDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      req.flash('error_msg', 'Drive not found.');
      return res.redirect('/admin/drives');
    }
    const companies = await Company.find().sort({ name: 1 });
    res.render('admin/driveEdit', {
      pageTitle: `Edit Drive - ${drive.companyName} | Placement Cell`,
      drive,
      companies
    });
  } catch (error) {
    console.error('Get edit drive error:', error);
    req.flash('error_msg', 'Unable to retrieve drive details.');
    res.redirect('/admin/drives');
  }
};

// Handle Drive Update
exports.postEditDrive = async (req, res) => {
  try {
    const {
      companyName,
      companyLogoUrl,
      type,
      role,
      description,
      package: pkg,
      stipend,
      location,
      workMode,
      minCGPA,
      eligibleBranches,
      graduationYear,
      maxBacklogs,
      requiredSkills,
      applicationDeadline,
      driveDate,
      openings,
      companyWebsite,
      status
    } = req.body;

    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      req.flash('error_msg', 'Drive not found.');
      return res.redirect('/admin/drives');
    }

    const branchesArray = Array.isArray(eligibleBranches)
      ? eligibleBranches
      : (eligibleBranches || '').split(',').map((b) => b.trim()).filter(Boolean);

    const skillsArray = requiredSkills
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    drive.companyName = companyName ? companyName.trim() : drive.companyName;
    drive.companyLogoUrl = companyLogoUrl !== undefined ? companyLogoUrl.trim() : drive.companyLogoUrl;
    drive.type = type || drive.type;
    drive.role = role ? role.trim() : drive.role;
    drive.description = description ? description.trim() : drive.description;
    drive.package = pkg !== undefined ? pkg.trim() : drive.package;
    drive.stipend = stipend !== undefined ? stipend.trim() : drive.stipend;
    drive.location = location ? location.trim() : drive.location;
    drive.workMode = workMode || drive.workMode;
    drive.minCGPA = minCGPA !== undefined ? parseFloat(minCGPA) : drive.minCGPA;
    drive.eligibleBranches = branchesArray.length > 0 ? branchesArray : drive.eligibleBranches;
    drive.graduationYear = graduationYear ? parseInt(graduationYear, 10) : drive.graduationYear;
    drive.maxBacklogs = maxBacklogs !== undefined ? parseInt(maxBacklogs, 10) : drive.maxBacklogs;
    drive.requiredSkills = skillsArray;
    if (applicationDeadline) drive.applicationDeadline = new Date(applicationDeadline);
    if (driveDate) drive.driveDate = new Date(driveDate);
    drive.openings = openings ? parseInt(openings, 10) : drive.openings;
    drive.companyWebsite = companyWebsite !== undefined ? companyWebsite.trim() : drive.companyWebsite;
    drive.status = status || drive.status;

    await drive.save();

    req.flash('success_msg', 'Drive updated successfully!');
    res.redirect('/admin/drives');
  } catch (error) {
    console.error('Update drive error:', error);
    req.flash('error_msg', 'Failed to update drive information.');
    res.redirect(`/admin/drives/${req.params.id}/edit`);
  }
};

// Delete Drive
exports.deleteDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      req.flash('error_msg', 'Drive not found.');
      return res.redirect('/admin/drives');
    }

    // Delete associated applications
    await Application.deleteMany({ drive: drive._id });
    await Drive.findByIdAndDelete(req.params.id);

    req.flash('success_msg', `Drive for ${drive.companyName} and associated applications were removed.`);
    res.redirect('/admin/drives');
  } catch (error) {
    console.error('Delete drive error:', error);
    req.flash('error_msg', 'Could not delete drive.');
    res.redirect('/admin/drives');
  }
};

// View Drive Applicants with Filter & Auto-Eligibility Evaluation
exports.getDriveApplicants = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      req.flash('error_msg', 'Drive record not found.');
      return res.redirect('/admin/drives');
    }

    const { status, eligibleOnly } = req.query;

    const filter = { drive: drive._id };
    if (status && ['Applied', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected'].includes(status)) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    // Annotate applicants with eligibility evaluation
    let applicantRows = applications.map((app) => {
      const eligibility = checkEligibility(app.student, drive);
      return {
        ...app.toObject(),
        eligibility
      };
    });

    if (eligibleOnly === 'true') {
      applicantRows = applicantRows.filter((row) => row.eligibility.eligible);
    }

    // Pipeline counts for filter pills
    const allApps = await Application.find({ drive: drive._id });
    const counts = {
      all: allApps.length,
      Applied: allApps.filter((a) => a.status === 'Applied').length,
      Shortlisted: allApps.filter((a) => a.status === 'Shortlisted').length,
      Interviewed: allApps.filter((a) => a.status === 'Interviewed').length,
      Selected: allApps.filter((a) => a.status === 'Selected').length,
      Rejected: allApps.filter((a) => a.status === 'Rejected').length
    };

    res.render('admin/applicants', {
      pageTitle: `Applicants - ${drive.companyName} (${drive.role})`,
      drive,
      applicants: applicantRows,
      counts,
      activeStatus: status || 'All',
      eligibleOnly: eligibleOnly === 'true'
    });
  } catch (error) {
    console.error('Drive applicants error:', error);
    req.flash('error_msg', 'Could not load drive applicants.');
    res.redirect('/admin/drives');
  }
};

// Update Applicant Status with Placement Policy Enforcement Hook
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { applicationId, newStatus, comment } = req.body;
    const driveId = req.params.id;

    const application = await Application.findById(applicationId).populate('student');
    const drive = await Drive.findById(driveId);

    if (!application || !drive) {
      req.flash('error_msg', 'Application or drive record not found.');
      return res.redirect(`/admin/drives/${driveId}/applicants`);
    }

    const oldStatus = application.status;
    application.status = newStatus;

    // Add status history record
    application.statusHistory.push({
      status: newStatus,
      comment: comment ? comment.trim() : `Status transitioned from ${oldStatus} to ${newStatus}.`,
      changedAt: new Date(),
      changedBy: req.session.user.id
    });

    await application.save();

    // SECTION 14 PLACEMENT POLICY HOOK:
    // When marked "Selected": automatically mark student as placed
    if (newStatus === 'Selected' && drive.type === 'Placement') {
      const studentProfile = await StudentProfile.findById(application.student._id);
      if (studentProfile) {
        studentProfile.isPlaced = true;
        studentProfile.placedCompany = drive.companyName;
        studentProfile.placedRole = drive.role;
        studentProfile.placedPackage = drive.package || drive.stipend || 'Competitive Package';
        await studentProfile.save();
      }
    }

    req.flash('success_msg', `Candidate status successfully updated to "${newStatus}".`);
    res.redirect(`/admin/drives/${driveId}/applicants`);
  } catch (error) {
    console.error('Update applicant status error:', error);
    req.flash('error_msg', 'Failed to update applicant status.');
    res.redirect(`/admin/drives/${req.params.id}/applicants`);
  }
};

// Auto-Shortlist Eligible Candidates Action
exports.autoShortlistEligible = async (req, res) => {
  try {
    const driveId = req.params.id;
    const drive = await Drive.findById(driveId);
    if (!drive) {
      req.flash('error_msg', 'Drive not found.');
      return res.redirect('/admin/drives');
    }

    // Find all applicants currently in "Applied" status
    const applications = await Application.find({
      drive: drive._id,
      status: 'Applied'
    }).populate('student');

    let shortlistedCount = 0;

    for (const app of applications) {
      const eligibility = checkEligibility(app.student, drive);
      if (eligibility.eligible) {
        app.status = 'Shortlisted';
        app.statusHistory.push({
          status: 'Shortlisted',
          comment: 'Auto-shortlisted based on verified drive eligibility criteria.',
          changedAt: new Date(),
          changedBy: req.session.user.id
        });
        await app.save();
        shortlistedCount++;
      }
    }

    req.flash(
      'success_msg',
      `Auto-shortlist complete! Successfully advanced ${shortlistedCount} eligible candidate(s) to "Shortlisted".`
    );
    res.redirect(`/admin/drives/${driveId}/applicants`);
  } catch (error) {
    console.error('Auto shortlist error:', error);
    req.flash('error_msg', 'An error occurred during auto-shortlisting.');
    res.redirect(`/admin/drives/${req.params.id}/applicants`);
  }
};

// In-Depth Placement Analytics View
exports.getAnalytics = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const placedStudents = await StudentProfile.countDocuments({ isPlaced: true });
    const unplacedStudents = Math.max(0, totalStudents - placedStudents);

    // Branch breakdown
    const branchStats = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$branch',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$isPlaced', true] }, 1, 0] }
          },
          avgCGPA: { $avg: '$cgpa' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Company selections
    const companyStats = await Application.aggregate([
      { $match: { status: 'Selected' } },
      {
        $group: {
          _id: '$companyName',
          selections: { $sum: 1 }
        }
      },
      { $sort: { selections: -1 } }
    ]);

    // Pipeline breakdown across all drives
    const pipelineStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.render('admin/analytics', {
      pageTitle: 'Placement Analytics & Insights | Placement Cell',
      totalStudents,
      placedStudents,
      unplacedStudents,
      branchStats,
      companyStats,
      pipelineStats
    });
  } catch (error) {
    console.error('Analytics page error:', error);
    req.flash('error_msg', 'Could not load analytics data.');
    res.redirect('/admin/dashboard');
  }
};
