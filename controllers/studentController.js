const StudentProfile = require('../models/StudentProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const { checkEligibility } = require('../utils/eligibilityChecker');
const { calculateProfileCompleteness } = require('../utils/profileCompleteness');

// Student Dashboard Overview
exports.getDashboard = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.session.user.id });
    if (!profile) {
      req.flash('error_msg', 'Student profile not found. Please contact administration.');
      return res.redirect('/login');
    }

    const completeness = calculateProfileCompleteness(profile);

    // Fetch active drives
    const activeDrives = await Drive.find({ status: 'Active' }).sort({ applicationDeadline: 1 });

    // Process drives for eligibility
    let eligibleCount = 0;
    const recommendedDrives = [];

    for (const drive of activeDrives) {
      const eligibility = checkEligibility(profile, drive);
      if (eligibility.eligible) {
        eligibleCount++;
        recommendedDrives.push({
          ...drive.toObject(),
          eligibility
        });
      }
    }

    // Student applications
    const applications = await Application.find({ student: profile._id })
      .populate('drive')
      .sort({ createdAt: -1 });

    const totalApplied = applications.length;
    const interviewsCount = applications.filter((app) => app.status === 'Interviewed').length;
    const selectedCount = applications.filter((app) => app.status === 'Selected').length;

    res.render('student/dashboard', {
      pageTitle: 'Student Dashboard | Campus Placement',
      profile,
      completeness,
      stats: {
        availableDrives: activeDrives.length,
        eligibleDrives: eligibleCount,
        applicationsSubmitted: totalApplied,
        interviews: interviewsCount,
        selected: selectedCount
      },
      recommendedDrives: recommendedDrives.slice(0, 4),
      recentApplications: applications.slice(0, 5)
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    req.flash('error_msg', 'Unable to load dashboard.');
    res.redirect('/');
  }
};

// Render Profile View / Edit Form
exports.getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.session.user.id }).populate('user');
    const completeness = calculateProfileCompleteness(profile);

    res.render('student/profile', {
      pageTitle: 'My Profile | Student Portal',
      profile,
      completeness
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    req.flash('error_msg', 'Could not load profile details.');
    res.redirect('/student/dashboard');
  }
};

// Update Student Profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      rollNumber,
      branch,
      semester,
      graduationYear,
      cgpa,
      activeBacklogs,
      skills,
      phone,
      resumeUrl,
      linkedinUrl,
      githubUrl
    } = req.body;

    const profile = await StudentProfile.findOne({ user: req.session.user.id });
    if (!profile) {
      req.flash('error_msg', 'Profile not found.');
      return res.redirect('/student/dashboard');
    }

    // Process skills into array of strings
    const skillsArray = skills
      ? skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    profile.rollNumber = rollNumber ? rollNumber.toUpperCase().trim() : profile.rollNumber;
    profile.branch = branch || profile.branch;
    profile.semester = parseInt(semester, 10) || profile.semester;
    profile.graduationYear = parseInt(graduationYear, 10) || profile.graduationYear;
    profile.cgpa = parseFloat(cgpa) !== undefined ? parseFloat(cgpa) : profile.cgpa;
    profile.activeBacklogs =
      activeBacklogs !== undefined ? parseInt(activeBacklogs, 10) : profile.activeBacklogs;
    profile.skills = skillsArray;
    profile.phone = phone ? phone.trim() : '';
    profile.resumeUrl = resumeUrl ? resumeUrl.trim() : '';
    profile.linkedinUrl = linkedinUrl ? linkedinUrl.trim() : '';
    profile.githubUrl = githubUrl ? githubUrl.trim() : '';

    await profile.save();

    req.flash('success_msg', 'Profile updated successfully!');
    res.redirect('/student/profile');
  } catch (error) {
    console.error('Profile update error:', error);
    req.flash('error_msg', 'Failed to update profile. Ensure roll number is unique and inputs are valid.');
    res.redirect('/student/profile');
  }
};

// Browse Drives with Search & Filters
exports.getDrives = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.session.user.id });
    const { type, workMode, search, eligibilityFilter } = req.query;

    const query = { status: 'Active' };
    if (type && ['Placement', 'Internship'].includes(type)) {
      query.type = type;
    }
    if (workMode && ['On-site', 'Hybrid', 'Remote'].includes(workMode)) {
      query.workMode = workMode;
    }
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const drives = await Drive.find(query).sort({ applicationDeadline: 1 });

    // Fetch student's existing applications
    const existingApplications = await Application.find({ student: profile._id }).select('drive status');
    const appliedDriveMap = {};
    for (const app of existingApplications) {
      appliedDriveMap[app.drive.toString()] = app.status;
    }

    // Attach eligibility and application status to each drive
    let processedDrives = drives.map((drive) => {
      const eligibility = checkEligibility(profile, drive);
      return {
        ...drive.toObject(),
        eligibility,
        appliedStatus: appliedDriveMap[drive._id.toString()] || null
      };
    });

    // Filter by eligibility if requested
    if (eligibilityFilter === 'eligible_only') {
      processedDrives = processedDrives.filter((d) => d.eligibility.eligible);
    }

    res.render('student/drives', {
      pageTitle: 'Placement & Internship Drives | Student Portal',
      drives: processedDrives,
      profile,
      filters: {
        type: type || '',
        workMode: workMode || '',
        search: search || '',
        eligibilityFilter: eligibilityFilter || ''
      }
    });
  } catch (error) {
    console.error('Fetch drives error:', error);
    req.flash('error_msg', 'Could not load drives.');
    res.redirect('/student/dashboard');
  }
};

// View Individual Drive Details with Eligibility Evaluation
exports.getDriveDetail = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      req.flash('error_msg', 'Placement drive not found.');
      return res.redirect('/student/drives');
    }

    const profile = await StudentProfile.findOne({ user: req.session.user.id });
    const eligibility = checkEligibility(profile, drive);

    const existingApplication = await Application.findOne({
      student: profile._id,
      drive: drive._id
    });

    res.render('student/driveDetail', {
      pageTitle: `${drive.companyName} - ${drive.role} | Drive Details`,
      drive,
      profile,
      eligibility,
      existingApplication
    });
  } catch (error) {
    console.error('Drive detail error:', error);
    req.flash('error_msg', 'Could not retrieve drive details.');
    res.redirect('/student/drives');
  }
};

// Apply to a Placement / Internship Drive
exports.applyDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      req.flash('error_msg', 'Placement drive not found.');
      return res.redirect('/student/drives');
    }

    const profile = await StudentProfile.findOne({ user: req.session.user.id });
    if (!profile) {
      req.flash('error_msg', 'Student profile record missing.');
      return res.redirect('/student/dashboard');
    }

    // 1. STRICT BACKEND ELIGIBILITY CHECK
    const eligibility = checkEligibility(profile, drive);
    if (!eligibility.eligible) {
      req.flash(
        'error_msg',
        `Application rejected: You do not meet the eligibility requirements. Reason: ${eligibility.reasons.join(
          ' '
        )}`
      );
      return res.redirect(`/student/drives/${drive._id}`);
    }

    // 2. PREVENT DUPLICATE APPLICATIONS
    const alreadyApplied = await Application.findOne({
      student: profile._id,
      drive: drive._id
    });
    if (alreadyApplied) {
      req.flash('error_msg', 'You have already submitted an application for this drive.');
      return res.redirect('/student/applications');
    }

    // 3. CREATE APPLICATION DOCUMENT
    const application = new Application({
      student: profile._id,
      drive: drive._id,
      companyName: drive.companyName,
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          comment: 'Application successfully submitted by student.',
          changedAt: new Date()
        }
      ]
    });
    await application.save();

    req.flash('success_msg', `Successfully applied to ${drive.companyName} for ${drive.role}!`);
    res.redirect('/student/applications');
  } catch (error) {
    console.error('Application submission error:', error);
    req.flash('error_msg', 'Failed to submit application. Please try again.');
    res.redirect(`/student/drives/${req.params.id}`);
  }
};

// View Student's Applications & Pipeline Timeline
exports.getMyApplications = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.session.user.id });
    const applications = await Application.find({ student: profile._id })
      .populate('drive')
      .sort({ createdAt: -1 });

    res.render('student/applications', {
      pageTitle: 'My Applications | Student Portal',
      applications,
      profile
    });
  } catch (error) {
    console.error('Applications view error:', error);
    req.flash('error_msg', 'Could not load your applications.');
    res.redirect('/student/dashboard');
  }
};

// View Placement Status / Offer Details
exports.getPlacementStatus = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.session.user.id });
    const selectedApplication = await Application.findOne({
      student: profile._id,
      status: 'Selected'
    }).populate('drive');

    res.render('student/placementStatus', {
      pageTitle: 'Placement Status | Student Portal',
      profile,
      selectedApplication
    });
  } catch (error) {
    console.error('Placement status error:', error);
    req.flash('error_msg', 'Could not retrieve placement status.');
    res.redirect('/student/dashboard');
  }
};
