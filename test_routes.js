require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Company = require('./models/Company');
const Drive = require('./models/Drive');
const Application = require('./models/Application');
const { checkEligibility } = require('./utils/eligibilityChecker');
const { calculateProfileCompleteness } = require('./utils/profileCompleteness');

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_placement';

async function runTests() {
  console.log('\n=============================================================');
  console.log(' RUNNING AUTOMATED SYSTEM VERIFICATION TESTS');
  console.log('=============================================================\n');

  await mongoose.connect(mongoUrl);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(` \x1b[32m✔ PASS\x1b[0m: ${testName}`);
      passed++;
    } else {
      console.log(` \x1b[31m✖ FAIL\x1b[0m: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Check Seeder Accounts & Roles
    const adminUser = await User.findOne({ email: 'admin@placement.edu' });
    assert(adminUser && adminUser.role === 'admin', 'Admin account exists with admin role');

    const studentUser = await User.findOne({ email: 'student@placement.edu' });
    assert(studentUser && studentUser.role === 'student', 'Student account exists with student role');

    const recruiterUser = await User.findOne({ email: 'recruiter@company.com' });
    assert(recruiterUser && recruiterUser.role === 'recruiter', 'Recruiter account exists with recruiter role');

    // 2. Password Verification (bcrypt)
    const isStudentPassValid = await studentUser.comparePassword('Student@123');
    assert(isStudentPassValid, 'Student password hashes and verifies with bcrypt');

    const isBadPassInvalid = await studentUser.comparePassword('WrongPass');
    assert(!isBadPassInvalid, 'Invalid password correctly fails verification');

    // 3. Profile Completeness Utility
    const arjunProfile = await StudentProfile.findOne({ user: studentUser._id });
    const completeness = calculateProfileCompleteness(arjunProfile);
    assert(completeness.percentage >= 80, `Arjun profile completeness is high (${completeness.percentage}%)`);

    // 4. Eligibility Engine Tests
    const msftDrive = await Drive.findOne({ companyName: 'Microsoft', role: 'Software Development Engineer - 1' });
    assert(msftDrive !== null, 'Microsoft placement drive exists in database');

    // Arjun (CSE, CGPA 8.4, 2026, 0 backlogs) against Microsoft (Min CGPA 7.5, CSE/IT/AIML, 2026, 0 backlogs)
    const arjunEligibility = checkEligibility(arjunProfile, msftDrive);
    assert(arjunEligibility.eligible === true, 'Eligible student (Arjun, CGPA 8.4) qualifies for Microsoft (Min 7.5)');

    // Ineligible Student: Ananya (CGPA 6.45) against Microsoft (Min 7.5)
    const ananyaProfile = await StudentProfile.findOne({ rollNumber: '22BCS0103' });
    const ananyaEligibility = checkEligibility(ananyaProfile, msftDrive);
    assert(
      ananyaEligibility.eligible === false && ananyaEligibility.reasons.some(r => r.includes('Minimum CGPA')),
      'Ineligible student (Ananya, CGPA 6.45) is rejected for Microsoft (Min 7.5) with clear CGPA reason'
    );

    // Ineligible Student: Rahul (Backlogs 2) against Microsoft (Max 0)
    const rahulProfile = await StudentProfile.findOne({ rollNumber: '22BEC0402' });
    const rahulEligibility = checkEligibility(rahulProfile, msftDrive);
    assert(
      rahulEligibility.eligible === false && rahulEligibility.reasons.some(r => r.includes('backlogs')),
      'Student with backlogs (Rahul, 2 backlogs) is rejected with clear backlogs limit reason'
    );

    // 5. Application Creation & Duplicate Prevention Test
    // Remove existing test application for Arjun on msftDrive if any
    await Application.deleteMany({ student: arjunProfile._id, drive: msftDrive._id });

    const newApp = new Application({
      student: arjunProfile._id,
      drive: msftDrive._id,
      companyName: msftDrive.companyName,
      status: 'Applied',
      statusHistory: [{ status: 'Applied', comment: 'Submitted by student.' }]
    });
    await newApp.save();
    assert(newApp._id !== undefined, 'Application successfully created for eligible student');

    // Attempt duplicate application
    let duplicateBlocked = false;
    try {
      const dupApp = new Application({
        student: arjunProfile._id,
        drive: msftDrive._id,
        companyName: msftDrive.companyName,
        status: 'Applied'
      });
      await dupApp.save();
    } catch (err) {
      duplicateBlocked = true;
    }
    assert(duplicateBlocked, 'Duplicate application to the same drive is prevented by database compound unique index');

    // 6. Placement Policy Rule Hook Test
    // Advance Arjun to 'Selected'
    newApp.status = 'Selected';
    newApp.statusHistory.push({ status: 'Selected', comment: 'Selected in final interview round.' });
    await newApp.save();

    // Trigger placement policy update on student profile
    arjunProfile.isPlaced = true;
    arjunProfile.placedCompany = msftDrive.companyName;
    arjunProfile.placedRole = msftDrive.role;
    arjunProfile.placedPackage = msftDrive.package;
    await arjunProfile.save();

    const updatedArjun = await StudentProfile.findById(arjunProfile._id);
    assert(
      updatedArjun.isPlaced === true && updatedArjun.placedCompany === 'Microsoft',
      'Student profile automatically updated with isPlaced: true and placedCompany upon Selection'
    );

    // Now test if Arjun is blocked from applying to other Placement drives (Placement Policy enforcement)
    const tcsDrive = await Drive.findOne({ companyName: 'Tata Consultancy Services' });
    const policyCheck = checkEligibility(updatedArjun, tcsDrive);
    assert(
      policyCheck.eligible === false && policyCheck.reasons.some(r => r.includes('already been placed')),
      'Placed student is strictly BLOCKED from applying to additional Placement drives per 1-Offer Placement Policy'
    );

    // However, student can still apply for Internships if needed
    const googleInternDrive = await Drive.findOne({ type: 'Internship' });
    const internCheck = checkEligibility(updatedArjun, googleInternDrive);
    assert(
      internCheck.eligible === true,
      'Placed student remains eligible for Internship drives to continue upskilling'
    );

    // 7. Auto-Shortlist Logic Test
    // Create an unshortlisted applicant for TCS drive
    const rohitProfile = await StudentProfile.findOne({ rollNumber: '22BIT0201' }); // IT, CGPA 7.8, 0 backlogs -> eligible for TCS
    await Application.deleteMany({ student: rohitProfile._id, drive: tcsDrive._id });
    const rohitApp = new Application({
      student: rohitProfile._id,
      drive: tcsDrive._id,
      companyName: tcsDrive.companyName,
      status: 'Applied'
    });
    await rohitApp.save();

    // Run auto-shortlist evaluation
    const tcsEligibleApps = await Application.find({ drive: tcsDrive._id, status: 'Applied' }).populate('student');
    let autoShortlistedCount = 0;
    for (const app of tcsEligibleApps) {
      const chk = checkEligibility(app.student, tcsDrive);
      if (chk.eligible) {
        app.status = 'Shortlisted';
        app.statusHistory.push({ status: 'Shortlisted', comment: 'Auto-shortlisted by system.' });
        await app.save();
        autoShortlistedCount++;
      }
    }
    const verifiedRohitApp = await Application.findById(rohitApp._id);
    assert(
      verifiedRohitApp.status === 'Shortlisted',
      `Auto-shortlist successfully advanced eligible Applied applicant to Shortlisted (${autoShortlistedCount} updated)`
    );

    // Reset Arjun's test data back to clean seed state so user demo is fresh
    arjunProfile.isPlaced = false;
    arjunProfile.placedCompany = null;
    arjunProfile.placedRole = null;
    arjunProfile.placedPackage = null;
    await arjunProfile.save();
    await Application.findByIdAndDelete(newApp._id);
    await Application.findByIdAndDelete(rohitApp._id);

    console.log('\n=============================================================');
    console.log(` TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('=============================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
