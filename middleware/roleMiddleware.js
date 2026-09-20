// Middleware to restrict access to Admins (Placement Officers) only
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).render('403', {
    pageTitle: 'Access Denied - Admin Only',
    message: 'You do not have administrative privileges to access this page.'
  });
};

// Middleware to restrict access to Students only
const isStudent = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'student') {
    return next();
  }
  res.status(403).render('403', {
    pageTitle: 'Access Denied - Student Only',
    message: 'This area is reserved for registered students only.'
  });
};

// Middleware to restrict access to Recruiters only
const isRecruiter = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'recruiter') {
    return next();
  }
  res.status(403).render('403', {
    pageTitle: 'Access Denied - Recruiter Only',
    message: 'This portal section is restricted to registered company recruiters.'
  });
};

module.exports = {
  isAdmin,
  isStudent,
  isRecruiter
};
