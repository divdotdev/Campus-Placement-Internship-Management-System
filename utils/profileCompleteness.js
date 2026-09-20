/**
 * Calculates the completeness percentage of a student profile.
 *
 * @param {Object} profile - StudentProfile document or object
 * @returns {Object} { percentage: number, missingFields: string[] }
 */
function calculateProfileCompleteness(profile) {
  if (!profile) {
    return { percentage: 0, missingFields: ['Personal & Academic Profile'] };
  }

  const checklist = [
    { field: 'rollNumber', weight: 10, label: 'University Roll Number' },
    { field: 'branch', weight: 10, label: 'Academic Branch' },
    { field: 'semester', weight: 10, label: 'Current Semester' },
    { field: 'graduationYear', weight: 10, label: 'Graduation Year' },
    { field: 'cgpa', weight: 15, label: 'CGPA' },
    {
      field: 'skills',
      weight: 15,
      label: 'Key Skills',
      test: (val) => Array.isArray(val) && val.length > 0
    },
    { field: 'phone', weight: 10, label: 'Phone Number' },
    { field: 'resumeUrl', weight: 10, label: 'Resume Link' },
    { field: 'linkedinUrl', weight: 5, label: 'LinkedIn Profile' },
    { field: 'githubUrl', weight: 5, label: 'GitHub Profile' }
  ];

  let completedWeight = 0;
  const missingFields = [];

  for (const item of checklist) {
    const val = profile[item.field];
    const isPresent = item.test ? item.test(val) : val !== undefined && val !== null && String(val).trim() !== '';

    if (isPresent) {
      completedWeight += item.weight;
    } else {
      missingFields.push(item.label);
    }
  }

  return {
    percentage: Math.min(100, Math.round(completedWeight)),
    missingFields
  };
}

module.exports = {
  calculateProfileCompleteness
};
