/**
 * Utility to verify student eligibility for a placement or internship drive.
 * Evaluates:
 * 1. Placement Policy: If drive is a placement and student is already placed
 * 2. Active Drive Status
 * 3. Application Deadline
 * 4. Minimum CGPA
 * 5. Eligible Academic Branches
 * 6. Allowed Graduation Year
 * 7. Maximum Allowed Active Backlogs
 *
 * @param {Object} studentProfile - Mongoose StudentProfile document or plain object
 * @param {Object} drive - Mongoose Drive document or plain object
 * @returns {Object} { eligible: boolean, reasons: string[] }
 */
function checkEligibility(studentProfile, drive) {
  const reasons = [];

  if (!studentProfile) {
    return {
      eligible: false,
      reasons: ['Please complete your student profile before applying to drives.']
    };
  }

  // 1. Placement Policy Check
  if (drive.type === 'Placement' && studentProfile.isPlaced) {
    reasons.push(
      'You have already been placed through the campus placement process (placed at ' +
        (studentProfile.placedCompany || 'Campus Drive') +
        '). According to the placement policy, you cannot apply for additional placement drives.'
    );
  }

  // 2. Drive Status
  if (drive.status === 'Closed') {
    reasons.push('This drive has been closed by the placement cell.');
  }

  // 3. Application Deadline Check
  const now = new Date();
  const deadline = new Date(drive.applicationDeadline);
  // Set deadline comparison to end of deadline day if time not specified
  if (now > deadline) {
    reasons.push(
      `The application deadline (${deadline.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}) has passed.`
    );
  }

  // 4. CGPA Requirement
  const studentCgpa = parseFloat(studentProfile.cgpa) || 0;
  const driveMinCgpa = parseFloat(drive.minCGPA) || 0;
  if (studentCgpa < driveMinCgpa) {
    reasons.push(
      `Minimum CGPA required is ${driveMinCgpa.toFixed(1)}, but your current CGPA is ${studentCgpa.toFixed(1)}.`
    );
  }

  // 5. Eligible Branches Check
  if (Array.isArray(drive.eligibleBranches) && drive.eligibleBranches.length > 0) {
    const branches = drive.eligibleBranches.map((b) => b.toUpperCase());
    const isAll = branches.includes('ALL');
    const studentBranch = (studentProfile.branch || '').toUpperCase();

    if (!isAll && !branches.includes(studentBranch)) {
      reasons.push(
        `Your branch (${studentProfile.branch}) is not listed in eligible branches (${drive.eligibleBranches.join(', ')}).`
      );
    }
  }

  // 6. Graduation Year Check
  if (drive.graduationYear && studentProfile.graduationYear) {
    if (parseInt(studentProfile.graduationYear, 10) !== parseInt(drive.graduationYear, 10)) {
      reasons.push(
        `This drive is exclusively for the ${drive.graduationYear} graduating batch (Your batch: ${studentProfile.graduationYear}).`
      );
    }
  }

  // 7. Maximum Backlogs Check
  const studentBacklogs = parseInt(studentProfile.activeBacklogs, 10) || 0;
  const maxBacklogsAllowed = parseInt(drive.maxBacklogs, 10) || 0;
  if (studentBacklogs > maxBacklogsAllowed) {
    reasons.push(
      `Drive permits a maximum of ${maxBacklogsAllowed} active backlogs (You have ${studentBacklogs}).`
    );
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}

module.exports = {
  checkEligibility
};
