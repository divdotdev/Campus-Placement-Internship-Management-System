const User = require('../models/User');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const { checkEligibility } = require('../utils/eligibilityChecker');

// Recruiter Dashboard Overview
exports.getDashboard = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.session.user.id });
    if (!company) {
      req.flash('error_msg', 'Company profile not initialized.');
      return res.redirect('/recruiter/profile');
    }

    // Get all drives created by this recruiter
    const myDrives = await Drive.find({ createdBy: req.session.user.id }).sort({ createdAt: -1 });
    const driveIds = myDrives.map((d) => d._id);

    // Get applications for these drives only
    const applications = await Application.find({ drive: { $in: driveIds } })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('drive', 'role companyName type')
      .sort({ createdAt: -1 });

    const totalApplicants = applications.length;
    const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
    const interviewedCount = applications.filter((a) => a.status === 'Interviewed').length;
    const selectedCount = applications.filter((a) => a.status === 'Selected').length;

    res.render('recruiter/dashboard', {
      pageTitle: `${company.name} | Recruiter Portal`,
      company,
      stats: {
        totalDrives: myDrives.length,
        totalApplicants,
        shortlisted: shortlistedCount,
        interviewed: interviewedCount,
        selected: selectedCount
      },
      myDrives: myDrives.slice(0, 5),
      recentApplicants: applications.slice(0, 6)
    });
  } catch (error) {
    console.error('Recruiter dashboard error:', error);
    req.flash('error_msg', 'Could not load recruiter dashboard.');
    res.redirect('/');
  }
};

// Recruiter Company Profile View
exports.getProfile = async (req, res) => {
  try {
    let company = await Company.findOne({ user: req.session.user.id });
    if (!company) {
      // Create stub if missing
      company = new Company({
        user: req.session.user.id,
        name: req.session.user.name + ' Corp'
      });
      await company.save();
    }

    res.render('recruiter/profile', {
      pageTitle: 'Company Profile | Recruiter Portal',
      company
    });
  } catch (error) {
    console.error('Recruiter profile get error:', error);
    req.flash('error_msg', 'Unable to retrieve company profile.');
    res.redirect('/recruiter/dashboard');
  }
};

// Update Company Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, description, website, contactEmail, contactPerson, logoUrl } = req.body;
    let company = await Company.findOne({ user: req.session.user.id });

    if (!company) {
      company = new Company({ user: req.session.user.id });
    }

    company.name = name ? name.trim() : company.name;
    company.description = description ? description.trim() : '';
    company.website = website ? website.trim() : '';
    company.contactEmail = contactEmail ? contactEmail.trim() : '';
    company.contactPerson = contactPerson ? contactPerson.trim() : '';
    company.logoUrl = logoUrl ? logoUrl.trim() : '';

    await company.save();

    req.flash('success_msg', 'Company profile details updated successfully!');
    res.redirect('/recruiter/profile');
  } catch (error) {
    console.error('Recruiter profile update error:', error);
    req.flash('error_msg', 'Failed to update company details.');
    res.redirect('/recruiter/profile');
  }
};

// List Recruiter's Own Drives
exports.getMyDrives = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.session.user.id });
    const drives = await Drive.find({ createdBy: req.session.user.id }).sort({ createdAt: -1 });

    const driveRows = await Promise.all(
      drives.map(async (drive) => {
        const applicantCount = await Application.countDocuments({ drive: drive._id });
        return {
          ...drive.toObject(),
          applicantCount
        };
      })
    );

    res.render('recruiter/drives', {
      pageTitle: 'My Recruitment Drives | Recruiter Portal',
      drives: driveRows,
      company
    });
  } catch (error) {
    console.error('Recruiter drives error:', error);
    req.flash('error_msg', 'Could not load your drives.');
    res.redirect('/recruiter/dashboard');
  }
};

// Form to Create Drive for Recruiter's Company
exports.getCreateDrive = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.session.user.id });
    res.render('recruiter/driveCreate', {
      pageTitle: 'Post Recruitment Drive | Recruiter Portal',
      company
    });
  } catch (error) {
    console.error('Recruiter get create drive error:', error);
    res.redirect('/recruiter/drives');
  }
};

// Post New Drive by Recruiter
exports.postCreateDrive = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.session.user.id });
    const {
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
      openings
    } = req.body;

    const branchesArray = Array.isArray(eligibleBranches)
      ? eligibleBranches
      : (eligibleBranches || 'CSE,IT').split(',').map((b) => b.trim()).filter(Boolean);

    const skillsArray = requiredSkills
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const drive = new Drive({
      company: company ? company._id : null,
      companyName: company ? company.name : req.session.user.name,
      companyLogoUrl: company ? company.logoUrl : '',
      companyWebsite: company ? company.website : '',
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
      status: 'Active',
      createdBy: req.session.user.id
    });

    await drive.save();

    req.flash('success_msg', `Drive for ${drive.role} published successfully!`);
    res.redirect('/recruiter/drives');
  } catch (error) {
    console.error('Recruiter create drive error:', error);
    req.flash('error_msg', 'Failed to publish recruitment drive. Check all fields.');
    res.redirect('/recruiter/drives/create');
  }
};

// View Applicants for a Recruiter's Drive
exports.getDriveApplicants = async (req, res) => {
  try {
    const driveId = req.params.id;
    // Strict isolation: ensure this drive belongs to this recruiter
    const drive = await Drive.findOne({ _id: driveId, createdBy: req.session.user.id });
    if (!drive) {
      req.flash('error_msg', 'Drive not found or access unauthorized.');
      return res.redirect('/recruiter/drives');
    }

    const { status } = req.query;
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

    const applicantRows = applications.map((app) => {
      const eligibility = checkEligibility(app.student, drive);
      return {
        ...app.toObject(),
        eligibility
      };
    });

    res.render('recruiter/applicants', {
      pageTitle: `Applicants - ${drive.role} | Recruiter Portal`,
      drive,
      applicants: applicantRows,
      activeStatus: status || 'All'
    });
  } catch (error) {
    console.error('Recruiter drive applicants error:', error);
    req.flash('error_msg', 'Could not retrieve applicants.');
    res.redirect('/recruiter/drives');
  }
};

// Update Applicant Pipeline Status by Recruiter
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { applicationId, newStatus, comment } = req.body;
    const driveId = req.params.id;

    // Strict ownership verification
    const drive = await Drive.findOne({ _id: driveId, createdBy: req.session.user.id });
    if (!drive) {
      req.flash('error_msg', 'Unauthorized to modify applicants for this drive.');
      return res.redirect('/recruiter/drives');
    }

    const application = await Application.findOne({ _id: applicationId, drive: drive._id }).populate('student');
    if (!application) {
      req.flash('error_msg', 'Applicant record not found.');
      return res.redirect(`/recruiter/drives/${driveId}/applicants`);
    }

    const oldStatus = application.status;
    application.status = newStatus;
    application.statusHistory.push({
      status: newStatus,
      comment: comment ? comment.trim() : `Stage updated from ${oldStatus} to ${newStatus} by Recruiter.`,
      changedAt: new Date(),
      changedBy: req.session.user.id
    });
    await application.save();

    // Placement Policy Hook: If recruiter selects candidate for a placement
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

    req.flash('success_msg', `Candidate stage updated to "${newStatus}".`);
    res.redirect(`/recruiter/drives/${driveId}/applicants`);
  } catch (error) {
    console.error('Recruiter update applicant status error:', error);
    req.flash('error_msg', 'Failed to update candidate status.');
    res.redirect(`/recruiter/drives/${req.params.id}/applicants`);
  }
};
