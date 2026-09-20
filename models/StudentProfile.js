const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    rollNumber: {
      type: String,
      required: [true, 'University Roll Number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: ['CSE', 'IT', 'AIML', 'ECE', 'EE', 'MECH', 'CIVIL', 'OTHER'],
      default: 'CSE'
    },
    semester: {
      type: Number,
      required: [true, 'Current semester is required'],
      min: 1,
      max: 8,
      default: 7
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: 2020,
      max: 2035,
      default: 2026
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: 7.0
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: [0, 'Backlogs cannot be negative']
    },
    skills: {
      type: [String],
      default: []
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: ''
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: ''
    },
    githubUrl: {
      type: String,
      trim: true,
      default: ''
    },
    isPlaced: {
      type: Boolean,
      default: false
    },
    placedCompany: {
      type: String,
      default: null
    },
    placedRole: {
      type: String,
      default: null
    },
    placedPackage: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
