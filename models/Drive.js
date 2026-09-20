const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    companyLogoUrl: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      enum: ['Placement', 'Internship'],
      default: 'Placement',
      required: true
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true
    },
    package: {
      type: String,
      trim: true,
      default: ''
    },
    stipend: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Hybrid', 'Remote'],
      default: 'On-site'
    },
    minCGPA: {
      type: Number,
      required: [true, 'Minimum CGPA is required'],
      min: 0,
      max: 10,
      default: 6.0
    },
    eligibleBranches: {
      type: [String],
      required: true,
      default: ['CSE', 'IT']
    },
    graduationYear: {
      type: Number,
      required: [true, 'Allowed graduation year is required'],
      default: 2026
    },
    maxBacklogs: {
      type: Number,
      default: 0,
      min: 0
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline date is required']
    },
    driveDate: {
      type: Date,
      default: null
    },
    openings: {
      type: Number,
      default: 5,
      min: 1
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Drive', driveSchema);
