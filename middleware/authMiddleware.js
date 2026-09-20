// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Please log in to continue.');
  res.redirect('/login');
};

// Middleware to redirect already authenticated users away from login/register pages
const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    const role = req.session.user.role;
    if (role === 'admin') return res.redirect('/admin/dashboard');
    if (role === 'recruiter') return res.redirect('/recruiter/dashboard');
    return res.redirect('/student/dashboard');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isGuest
};
