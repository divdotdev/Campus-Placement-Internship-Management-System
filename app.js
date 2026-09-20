require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const connectDB = require('./config/db');
const Drive = require('./models/Drive');
const StudentProfile = require('./models/StudentProfile');
const Company = require('./models/Company');

// Initialize database connection
connectDB();

const app = express();

// Trust reverse proxy (essential for Vercel HTTPS & secure cookies)
app.set('trust proxy', 1);

// Ensure database connection before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session configuration
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_placement';
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'campus_placement_default_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUrl,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

// Flash messages
app.use(flash());

// Global template variables middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Import route modules
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');

// Public Landing Page Route with live database statistics
app.get('/', async (req, res, next) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const activeDrives = await Drive.countDocuments({ status: 'Active' });
    const distinctCompanies = await Drive.distinct('companyName', { status: 'Active' });
    const studentsPlaced = await StudentProfile.countDocuments({ isPlaced: true });
    const placementRate = totalStudents > 0 ? ((studentsPlaced / totalStudents) * 100).toFixed(1) : '0';

    const featuredDrives = await Drive.find({ status: 'Active' })
      .sort({ applicationDeadline: 1 })
      .limit(6);

    res.render('index', {
      pageTitle: 'Campus Placement & Internship Management System',
      stats: {
        activeDrives,
        companiesHiring: Math.max(distinctCompanies.length, 1),
        studentsPlaced,
        placementRate
      },
      featuredDrives
    });
  } catch (error) {
    next(error);
  }
});

// Mount modular route handlers
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);
app.use('/recruiter', recruiterRoutes);

// 404 Error Handler for undefined routes
app.use((req, res) => {
  res.status(404).render('404', {
    pageTitle: '404 - Page Not Found'
  });
});

// 500 Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).render('500', {
    pageTitle: '500 - Server Error'
  });
});

// Start listening (standalone server mode only; Vercel handles invocation via exported app)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  const HOST = '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(` Campus Placement & Internship Management System`);
    console.log(` Server active at: http://localhost:${PORT}`);
    console.log(` Bound to interface: ${HOST}:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
