const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Sign In | Campus Placement Portal',
    role: req.query.role || ''
  });
};
exports.postLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Please provide both email and password.');
      return res.redirect('/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }
    if (role && user.role !== role) {
      req.flash(
        'error_msg',
        `Account found, but registered as a ${user.role.toUpperCase()}. Please sign in through the appropriate role.`
      );
      return res.redirect(`/login?role=${user.role}`);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // Set session user
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', `Welcome back, ${user.name}!`);

    // Redirect to respective dashboard
    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    if (user.role === 'recruiter') return res.redirect('/recruiter/dashboard');
    return res.redirect('/student/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'A server error occurred during login. Please try again.');
    res.redirect('/login');
  }
};

// Render Student Registration Page
exports.getRegisterStudent = (req, res) => {
  res.render('auth/registerStudent', {
    pageTitle: 'Student Registration | Campus Placement Portal'
  });
};

// Handle Student Registration
exports.postRegisterStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      rollNumber,
      branch,
      semester,
      graduationYear,
      cgpa,
      phone
    } = req.body;

    if (!name || !email || !password || !rollNumber || !branch || !cgpa) {
      req.flash('error_msg', 'Please fill in all required fields.');
      return res.redirect('/register/student');
    }

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/register/student');
    }

    if (password.length < 6) {
      req.flash('error_msg', 'Password must be at least 6 characters long.');
      return res.redirect('/register/student');
    }

    // Check if email or roll number already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error_msg', 'An account with this email address already exists.');
      return res.redirect('/register/student');
    }

    const existingRoll = await StudentProfile.findOne({
      rollNumber: rollNumber.toUpperCase().trim()
    });
    if (existingRoll) {
      req.flash('error_msg', 'A student with this roll number is already registered.');
      return res.redirect('/register/student');
    }

    // Create User
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'student'
    });
    await user.save();

    // Create associated StudentProfile
    const profile = new StudentProfile({
      user: user._id,
      rollNumber: rollNumber.toUpperCase().trim(),
      branch: branch || 'CSE',
      semester: parseInt(semester, 10) || 7,
      graduationYear: parseInt(graduationYear, 10) || 2026,
      cgpa: parseFloat(cgpa) || 7.0,
      activeBacklogs: parseInt(req.body.activeBacklogs, 10) || 0,
      phone: phone ? phone.trim() : ''
    });
    await profile.save();

    // Initialize session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', 'Registration successful! Welcome to the placement portal.');
    res.redirect('/student/dashboard');
  } catch (error) {
    console.error('Student registration error:', error);
    req.flash('error_msg', 'Failed to register student. Please check your inputs.');
    res.redirect('/register/student');
  }
};

// Render Recruiter Registration Page
exports.getRegisterRecruiter = (req, res) => {
  res.render('auth/registerRecruiter', {
    pageTitle: 'Recruiter Registration | Campus Placement Portal'
  });
};

// Handle Recruiter Registration
exports.postRegisterRecruiter = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      companyName,
      website,
      contactPerson,
      contactEmail,
      description
    } = req.body;

    if (!name || !email || !password || !companyName) {
      req.flash('error_msg', 'Please fill in all required fields.');
      return res.redirect('/register/recruiter');
    }

    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match.');
      return res.redirect('/register/recruiter');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error_msg', 'An account with this email address already exists.');
      return res.redirect('/register/recruiter');
    }

    // Create User
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'recruiter'
    });
    await user.save();

    // Create associated Company
    const company = new Company({
      user: user._id,
      name: companyName.trim(),
      website: website ? website.trim() : '',
      contactPerson: contactPerson ? contactPerson.trim() : name.trim(),
      contactEmail: contactEmail ? contactEmail.trim() : email.trim(),
      description: description ? description.trim() : ''
    });
    await company.save();

    // Initialize session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', 'Recruiter account registered successfully!');
    res.redirect('/recruiter/dashboard');
  } catch (error) {
    console.error('Recruiter registration error:', error);
    req.flash('error_msg', 'Failed to register recruiter. Please try again.');
    res.redirect('/register/recruiter');
  }
};

// Handle Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
};
