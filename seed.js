require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Company = require('./models/Company');
const Drive = require('./models/Drive');
const Application = require('./models/Application');

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_placement';

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    console.log('[Seed] Cleaning old records...');
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Company.deleteMany({});
    await Drive.deleteMany({});
    await Application.deleteMany({});

    console.log('[Seed] Creating Administrator...');
    const adminUser = new User({
      name: 'Prof. Dr. Rajesh Khanna (Head T&P)',
      email: 'admin@placement.edu',
      password: 'Admin@123',
      role: 'admin'
    });
    await adminUser.save();

    console.log('[Seed] Creating Recruiters & Companies...');
    // Recruiter 1: Google
    const googleUser = new User({
      name: 'Sundar Rajan',
      email: 'recruiter@company.com',
      password: 'Recruiter@123',
      role: 'recruiter'
    });
    await googleUser.save();

    const googleCompany = new Company({
      user: googleUser._id,
      name: 'Google India',
      website: 'https://careers.google.com',
      contactPerson: 'Sundar Rajan',
      contactEmail: 'recruiter@company.com',
      description: 'Global technology leader in search, cloud, AI, and developer tools.'
    });
    await googleCompany.save();

    // Recruiter 2: Microsoft
    const msftUser = new User({
      name: 'Ananya Deshmukh',
      email: 'recruiter@microsoft.com',
      password: 'Recruiter@123',
      role: 'recruiter'
    });
    await msftUser.save();

    const msftCompany = new Company({
      user: msftUser._id,
      name: 'Microsoft',
      website: 'https://careers.microsoft.com',
      contactPerson: 'Ananya Deshmukh',
      contactEmail: 'recruiter@microsoft.com',
      description: 'Empowering every person and organization on the planet to achieve more.'
    });
    await msftCompany.save();

    // Recruiter 3: TCS
    const tcsUser = new User({
      name: 'Vikram Malhotra',
      email: 'recruiter@tcs.com',
      password: 'Recruiter@123',
      role: 'recruiter'
    });
    await tcsUser.save();

    const tcsCompany = new Company({
      user: tcsUser._id,
      name: 'Tata Consultancy Services',
      website: 'https://www.tcs.com/careers',
      contactPerson: 'Vikram Malhotra',
      contactEmail: 'recruiter@tcs.com',
      description: 'Global leader in IT services, consulting, and business solutions.'
    });
    await tcsCompany.save();

    // Additional Companies
    const infosysCompany = new Company({
      name: 'Infosys',
      website: 'https://www.infosys.com/careers',
      contactEmail: 'campus@infosys.com',
      description: 'Next-generation digital services and consulting.'
    });
    await infosysCompany.save();

    const deloitteCompany = new Company({
      name: 'Deloitte USI',
      website: 'https://careers.deloitte.com',
      contactEmail: 'campus@deloitte.com',
      description: 'Audit, consulting, advisory, and tax services for global enterprises.'
    });
    await deloitteCompany.save();

    const accentureCompany = new Company({
      name: 'Accenture',
      website: 'https://www.accenture.com/careers',
      contactEmail: 'campus@accenture.com',
      description: 'Delivering on the promise of technology and human ingenuity.'
    });
    await accentureCompany.save();

    console.log('[Seed] Creating Students...');
    // Primary Student for User Demo & Viva Testing
    const demoStudentUser = new User({
      name: 'Arjun Sharma',
      email: 'student@placement.edu',
      password: 'Student@123',
      role: 'student'
    });
    await demoStudentUser.save();

    const demoStudentProfile = new StudentProfile({
      user: demoStudentUser._id,
      rollNumber: '22BCS0101',
      branch: 'CSE',
      semester: 7,
      graduationYear: 2026,
      cgpa: 8.4,
      activeBacklogs: 0,
      skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Python', 'Data Structures'],
      phone: '+91 9876543210',
      resumeUrl: 'https://drive.google.com/file/d/sample-resume-arjun/view',
      linkedinUrl: 'https://linkedin.com/in/arjun-sharma',
      githubUrl: 'https://github.com/arjun-sharma-dev',
      isPlaced: false
    });
    await demoStudentProfile.save();

    // 12 Additional Students Across Branches & Scenarios
    const studentData = [
      {
        name: 'Priya Patel',
        email: 'priya.patel@placement.edu',
        rollNumber: '22BCS0102',
        branch: 'CSE',
        cgpa: 9.15,
        backlogs: 0,
        skills: ['C++', 'Distributed Systems', 'Go', 'System Design'],
        isPlaced: true,
        placedCompany: 'Microsoft',
        placedRole: 'Software Development Engineer - 1',
        placedPackage: '₹18.5 LPA'
      },
      {
        name: 'Rohit Verma',
        email: 'rohit.verma@placement.edu',
        rollNumber: '22BIT0201',
        branch: 'IT',
        cgpa: 7.8,
        backlogs: 0,
        skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
        isPlaced: false
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@placement.edu',
        rollNumber: '22AIML0301',
        branch: 'AIML',
        cgpa: 8.72,
        backlogs: 0,
        skills: ['Python', 'PyTorch', 'Computer Vision', 'FastAPI'],
        isPlaced: true,
        placedCompany: 'Google India',
        placedRole: 'Software Engineering Intern',
        placedPackage: '₹1,25,000 / month'
      },
      {
        name: 'Karan Singh',
        email: 'karan.singh@placement.edu',
        rollNumber: '22BEC0401',
        branch: 'ECE',
        cgpa: 7.25,
        backlogs: 1,
        skills: ['Embedded C', 'VLSI', 'Verilog', 'Python'],
        isPlaced: false
      },
      {
        name: 'Ananya Sen',
        email: 'ananya.sen@placement.edu',
        rollNumber: '22BCS0103',
        branch: 'CSE',
        cgpa: 6.45, // Test for CGPA cutoff ineligibility
        backlogs: 0,
        skills: ['HTML', 'CSS', 'JavaScript', 'SQL'],
        isPlaced: false
      },
      {
        name: 'Aditya Joshi',
        email: 'aditya.joshi@placement.edu',
        rollNumber: '22BME0501',
        branch: 'MECH',
        cgpa: 7.6,
        backlogs: 0,
        skills: ['SolidWorks', 'Ansys', 'Thermodynamics', 'AutoCAD'],
        isPlaced: true,
        placedCompany: 'Tata Motors',
        placedRole: 'Graduate Engineer Trainee',
        placedPackage: '₹8.0 LPA'
      },
      {
        name: 'Neha Gupta',
        email: 'neha.gupta@placement.edu',
        rollNumber: '22BCS0104',
        branch: 'CSE',
        cgpa: 8.9,
        backlogs: 0,
        skills: ['Java', 'Microservices', 'Kubernetes', 'AWS'],
        isPlaced: false
      },
      {
        name: 'Vikas Yadav',
        email: 'vikas.yadav@placement.edu',
        rollNumber: '22BIT0202',
        branch: 'IT',
        cgpa: 7.65,
        backlogs: 0,
        skills: ['C#', '.NET Core', 'SQL Server', 'Angular'],
        isPlaced: true,
        placedCompany: 'Tata Consultancy Services',
        placedRole: 'Digital Cadre Software Engineer',
        placedPackage: '₹7.5 LPA'
      },
      {
        name: 'Megha Nair',
        email: 'megha.nair@placement.edu',
        rollNumber: '22AIML0302',
        branch: 'AIML',
        cgpa: 8.2,
        backlogs: 0,
        skills: ['Natural Language Processing', 'TensorFlow', 'Python'],
        isPlaced: false
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@placement.edu',
        rollNumber: '22BEC0402',
        branch: 'ECE',
        cgpa: 6.8,
        backlogs: 2, // Test for backlog limit
        skills: ['Matlab', 'Circuit Design', 'Arduino'],
        isPlaced: false
      },
      {
        name: 'Pooja Sharma',
        email: 'pooja.sharma@placement.edu',
        rollNumber: '22BCS0105',
        branch: 'CSE',
        cgpa: 8.05,
        backlogs: 0,
        skills: ['React', 'Node.js', 'Express', 'PostgreSQL'],
        isPlaced: true,
        placedCompany: 'Infosys',
        placedRole: 'Specialist Programmer',
        placedPackage: '₹9.5 LPA'
      },
      {
        name: 'Aman Mishra',
        email: 'aman.mishra@placement.edu',
        rollNumber: '22BCV0601',
        branch: 'CIVIL',
        cgpa: 7.1,
        backlogs: 0,
        skills: ['STAAD Pro', 'Revit', 'Project Planning'],
        isPlaced: false
      }
    ];

    const studentProfiles = [demoStudentProfile];

    for (const item of studentData) {
      const u = new User({
        name: item.name,
        email: item.email,
        password: 'Student@123',
        role: 'student'
      });
      await u.save();

      const p = new StudentProfile({
        user: u._id,
        rollNumber: item.rollNumber,
        branch: item.branch,
        semester: 7,
        graduationYear: 2026,
        cgpa: item.cgpa,
        activeBacklogs: item.backlogs,
        skills: item.skills,
        phone: '+91 9123456780',
        resumeUrl: `https://drive.google.com/file/d/resume-${item.rollNumber.toLowerCase()}/view`,
        linkedinUrl: `https://linkedin.com/in/${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        githubUrl: `https://github.com/${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        isPlaced: item.isPlaced || false,
        placedCompany: item.placedCompany || null,
        placedRole: item.placedRole || null,
        placedPackage: item.placedPackage || null
      });
      await p.save();
      studentProfiles.push(p);
    }

    console.log('[Seed] Creating Recruitment Drives...');
    // Drive 1: Google Intern
    const drive1 = new Drive({
      company: googleCompany._id,
      companyName: 'Google India',
      type: 'Internship',
      role: 'Software Engineering Intern',
      description:
        'Join Google engineers to build impactful, scalable consumer and cloud services. Responsibilities include code implementation, testing, debugging, and cross-functional team collaboration.',
      stipend: '₹1,25,000 / month',
      location: 'Bangalore / Hyderabad',
      workMode: 'Hybrid',
      minCGPA: 8.0,
      eligibleBranches: ['CSE', 'IT', 'AIML'],
      graduationYear: 2026,
      maxBacklogs: 0,
      requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python'],
      applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in future
      driveDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      openings: 8,
      companyWebsite: 'https://careers.google.com',
      status: 'Active',
      createdBy: googleUser._id
    });
    await drive1.save();

    // Drive 2: Microsoft SDE-1
    const drive2 = new Drive({
      company: msftCompany._id,
      companyName: 'Microsoft',
      type: 'Placement',
      role: 'Software Development Engineer - 1',
      description:
        'Microsoft is seeking talented software engineers for Azure, Windows, and Office 365 core engineering teams. Focus areas include distributed cloud computing, performant systems, and AI integration.',
      package: '₹18.5 LPA',
      location: 'Hyderabad / Noida',
      workMode: 'Hybrid',
      minCGPA: 7.5,
      eligibleBranches: ['CSE', 'IT', 'AIML'],
      graduationYear: 2026,
      maxBacklogs: 0,
      requiredSkills: ['C#', 'C++', 'Algorithms', 'System Design', 'Cloud Architecture'],
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      openings: 12,
      companyWebsite: 'https://careers.microsoft.com',
      status: 'Active',
      createdBy: msftUser._id
    });
    await drive2.save();

    // Drive 3: TCS Digital
    const drive3 = new Drive({
      company: tcsCompany._id,
      companyName: 'Tata Consultancy Services',
      type: 'Placement',
      role: 'Digital Cadre Software Engineer',
      description:
        'TCS Digital is an exclusive hiring stream for innovators in deep-tech, full stack engineering, cloud solutions, and automation architectures.',
      package: '₹7.5 LPA',
      location: 'Pan India',
      workMode: 'On-site',
      minCGPA: 6.5,
      eligibleBranches: ['CSE', 'IT', 'AIML', 'ECE', 'EE'],
      graduationYear: 2026,
      maxBacklogs: 1,
      requiredSkills: ['Java', 'Python', 'SQL', 'Web Technologies'],
      applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      openings: 30,
      companyWebsite: 'https://www.tcs.com',
      status: 'Active',
      createdBy: tcsUser._id
    });
    await drive3.save();

    // Drive 4: Infosys Specialist Programmer
    const drive4 = new Drive({
      company: infosysCompany._id,
      companyName: 'Infosys',
      type: 'Placement',
      role: 'Specialist Programmer (Power Programmer)',
      description:
        'Specialist Programmer role designed for high-performing competitive coders who write complex algorithmic solutions and full-stack enterprise applications.',
      package: '₹9.5 LPA',
      location: 'Bangalore / Mysore / Pune',
      workMode: 'On-site',
      minCGPA: 7.0,
      eligibleBranches: ['CSE', 'IT', 'AIML', 'ECE'],
      graduationYear: 2026,
      maxBacklogs: 0,
      requiredSkills: ['DSA', 'Competitive Coding', 'Java', 'Python'],
      applicationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      openings: 15,
      companyWebsite: 'https://www.infosys.com',
      status: 'Active',
      createdBy: adminUser._id
    });
    await drive4.save();

    // Drive 5: Deloitte Consulting Analyst
    const drive5 = new Drive({
      company: deloitteCompany._id,
      companyName: 'Deloitte USI',
      type: 'Placement',
      role: 'Technology Consulting Analyst',
      description:
        'Analyze complex client business challenges, architect digital systems, configure ERP, and drive cloud transformation programs.',
      package: '₹11.5 LPA',
      location: 'Hyderabad / Mumbai / Gurgaon',
      workMode: 'Hybrid',
      minCGPA: 6.8,
      eligibleBranches: ['CSE', 'IT', 'AIML', 'ECE', 'MECH', 'CIVIL'],
      graduationYear: 2026,
      maxBacklogs: 0,
      requiredSkills: ['Problem Solving', 'Data Analysis', 'SQL', 'Communication'],
      applicationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      openings: 10,
      companyWebsite: 'https://careers.deloitte.com',
      status: 'Active',
      createdBy: adminUser._id
    });
    await drive5.save();

    // Drive 6: Accenture Advanced App Engineering Analyst
    const drive6 = new Drive({
      company: accentureCompany._id,
      companyName: 'Accenture',
      type: 'Placement',
      role: 'Advanced Application Engineering Analyst',
      description:
        'Deliver state-of-the-art enterprise solutions, cloud integrations, and mobile architectures across international client engagements.',
      package: '₹8.0 LPA',
      location: 'Bangalore / Chennai / Pune',
      workMode: 'On-site',
      minCGPA: 6.5,
      eligibleBranches: ['ALL'],
      graduationYear: 2026,
      maxBacklogs: 1,
      requiredSkills: ['Full Stack Development', 'Database Systems', 'Agile Methodologies'],
      applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      driveDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      openings: 25,
      companyWebsite: 'https://www.accenture.com',
      status: 'Active',
      createdBy: adminUser._id
    });
    await drive6.save();

    // Drive 7: Amazon (Closed Drive for Testing)
    const drive7 = new Drive({
      companyName: 'Amazon',
      type: 'Placement',
      role: 'Cloud Support Associate',
      description: 'Troubleshoot and resolve cloud infrastructure queries for AWS customers.',
      package: '₹12.0 LPA',
      location: 'Hyderabad',
      workMode: 'On-site',
      minCGPA: 7.2,
      eligibleBranches: ['CSE', 'IT', 'ECE'],
      graduationYear: 2026,
      maxBacklogs: 0,
      applicationDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired deadline
      status: 'Closed',
      createdBy: adminUser._id
    });
    await drive7.save();

    console.log('[Seed] Creating Pipeline Applications...');
    // Seed multi-stage applications
    const appsToCreate = [
      // Demo Student Applications
      {
        student: demoStudentProfile._id,
        drive: drive1._id,
        companyName: 'Google India',
        status: 'Shortlisted',
        history: [
          { status: 'Applied', comment: 'Application submitted by student.', changedAt: new Date(Date.now() - 6 * 86400000) },
          { status: 'Shortlisted', comment: 'Profile and CGPA cleared screening round.', changedAt: new Date(Date.now() - 3 * 86400000) }
        ]
      },
      {
        student: demoStudentProfile._id,
        drive: drive3._id,
        companyName: 'Tata Consultancy Services',
        status: 'Interviewed',
        history: [
          { status: 'Applied', comment: 'Application submitted by student.', changedAt: new Date(Date.now() - 8 * 86400000) },
          { status: 'Shortlisted', comment: 'Eligible criteria verified.', changedAt: new Date(Date.now() - 5 * 86400000) },
          { status: 'Interviewed', comment: 'Technical round completed.', changedAt: new Date(Date.now() - 2 * 86400000) }
        ]
      },
      {
        student: demoStudentProfile._id,
        drive: drive4._id,
        companyName: 'Infosys',
        status: 'Applied',
        history: [
          { status: 'Applied', comment: 'Application submitted by student.', changedAt: new Date(Date.now() - 1 * 86400000) }
        ]
      },
      // Priya Patel -> Selected at Microsoft
      {
        student: studentProfiles[1]._id,
        drive: drive2._id,
        companyName: 'Microsoft',
        status: 'Selected',
        history: [
          { status: 'Applied', comment: 'Applied by candidate.', changedAt: new Date(Date.now() - 12 * 86400000) },
          { status: 'Shortlisted', comment: 'CGPA 9.15 cleared threshold.', changedAt: new Date(Date.now() - 9 * 86400000) },
          { status: 'Interviewed', comment: 'Technical rounds 1 & 2 passed.', changedAt: new Date(Date.now() - 5 * 86400000) },
          { status: 'Selected', comment: 'Official placement offer rolled out (₹18.5 LPA).', changedAt: new Date(Date.now() - 1 * 86400000) }
        ]
      },
      // Sneha Reddy -> Selected at Google
      {
        student: studentProfiles[3]._id,
        drive: drive1._id,
        companyName: 'Google India',
        status: 'Selected',
        history: [
          { status: 'Applied', comment: 'Applied.', changedAt: new Date(Date.now() - 10 * 86400000) },
          { status: 'Shortlisted', comment: 'Screening passed.', changedAt: new Date(Date.now() - 7 * 86400000) },
          { status: 'Interviewed', comment: 'Technical interview passed.', changedAt: new Date(Date.now() - 4 * 86400000) },
          { status: 'Selected', comment: 'Internship offer extended.', changedAt: new Date(Date.now() - 2 * 86400000) }
        ]
      },
      // Rohit Verma -> Microsoft (Interviewed) & TCS (Applied)
      {
        student: studentProfiles[2]._id,
        drive: drive2._id,
        companyName: 'Microsoft',
        status: 'Interviewed',
        history: [
          { status: 'Applied', comment: 'Applied.', changedAt: new Date(Date.now() - 7 * 86400000) },
          { status: 'Shortlisted', comment: 'Shortlisted.', changedAt: new Date(Date.now() - 4 * 86400000) },
          { status: 'Interviewed', comment: 'Interview scheduled.', changedAt: new Date(Date.now() - 1 * 86400000) }
        ]
      },
      {
        student: studentProfiles[2]._id,
        drive: drive3._id,
        companyName: 'Tata Consultancy Services',
        status: 'Applied',
        history: [{ status: 'Applied', comment: 'Application submitted.', changedAt: new Date(Date.now() - 2 * 86400000) }]
      },
      // Neha Gupta -> Deloitte (Shortlisted) & Accenture (Applied)
      {
        student: studentProfiles[7]._id,
        drive: drive5._id,
        companyName: 'Deloitte USI',
        status: 'Shortlisted',
        history: [
          { status: 'Applied', comment: 'Application submitted.', changedAt: new Date(Date.now() - 4 * 86400000) },
          { status: 'Shortlisted', comment: 'Shortlisted for group discussion.', changedAt: new Date(Date.now() - 1 * 86400000) }
        ]
      },
      // Vikas Yadav -> Selected at TCS
      {
        student: studentProfiles[8]._id,
        drive: drive3._id,
        companyName: 'Tata Consultancy Services',
        status: 'Selected',
        history: [
          { status: 'Applied', comment: 'Applied.', changedAt: new Date(Date.now() - 14 * 86400000) },
          { status: 'Shortlisted', comment: 'Shortlisted.', changedAt: new Date(Date.now() - 10 * 86400000) },
          { status: 'Interviewed', comment: 'Interviewed.', changedAt: new Date(Date.now() - 6 * 86400000) },
          { status: 'Selected', comment: 'Selected for Digital role.', changedAt: new Date(Date.now() - 2 * 86400000) }
        ]
      },
      // Pooja Sharma -> Selected at Infosys
      {
        student: studentProfiles[11]._id,
        drive: drive4._id,
        companyName: 'Infosys',
        status: 'Selected',
        history: [
          { status: 'Applied', comment: 'Applied.', changedAt: new Date(Date.now() - 11 * 86400000) },
          { status: 'Shortlisted', comment: 'Shortlisted.', changedAt: new Date(Date.now() - 7 * 86400000) },
          { status: 'Interviewed', comment: 'Coding round cleared.', changedAt: new Date(Date.now() - 3 * 86400000) },
          { status: 'Selected', comment: 'Selected for Power Programmer role.', changedAt: new Date(Date.now() - 1 * 86400000) }
        ]
      }
    ];

    for (const app of appsToCreate) {
      const newApp = new Application({
        student: app.student,
        drive: app.drive,
        companyName: app.companyName,
        status: app.status,
        statusHistory: app.history
      });
      await newApp.save();
    }

    console.log('====================================================');
    console.log(' SEEDING COMPLETE! Database populated successfully.');
    console.log(' Demo Accounts Created:');
    console.log(' 1. Admin:     admin@placement.edu     / Admin@123');
    console.log(' 2. Student:   student@placement.edu   / Student@123');
    console.log(' 3. Recruiter: recruiter@company.com   / Recruiter@123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();
