# Campus Placement & Internship Management System

> **College Assignment 2 &bull; Full-Stack Web Application**  
> Built with **Node.js, Express.js, EJS (Server-Side Rendering), MongoDB (Mongoose), and Bootstrap 5**.

---

## 📌 Problem Statement

In academic institutions, managing placement and internship drives manually using spreadsheets leads to:
- Time-consuming manual eligibility checks (CGPA, backlogs, branch).
- Accidental duplicate applications and missed deadlines.
- Difficulty enforcing placement policies (e.g., blocking already-placed students from monopolizing multiple job offers).
- Lack of consolidated, real-time analytics for placement officers and department heads.

This **Campus Placement & Internship Management System** digitizes the entire campus recruitment cycle with automated eligibility checks, real-time status tracking, role-based access control, and recruitment analytics.

---

## 🚀 Key Features

### 1. Three Distinct User Roles
- **Student**:
  - Register, sign in, and maintain academic & professional profiles (CGPA, backlogs, branch, resume links, skills).
  - Profile completeness progress meter (0–100%).
  - Real-time automatic eligibility feedback on all drives (`✓ Eligible` vs `✕ Ineligible` with specific rejection reasons).
  - 1-Click application submission with duplicate prevention.
  - Multi-stage application pipeline tracker (`Applied` $\rightarrow$ `Shortlisted` $\rightarrow$ `Interviewed` $\rightarrow$ `Selected` / `Rejected`) with timestamped activity logs.
  - Institutional placement policy standing display.
- **Placement Officer / Admin**:
  - Dedicated admin dashboard featuring 6 key institutional metrics (Total Students, Active Drives, Total Applications, Placed, Unplaced, Placement Rate %).
  - Interactive **Chart.js** visualizations for branch-wise placement ratios and top hiring companies.
  - Comprehensive drive management (Create, Edit, Delete, Filter, and Close drives).
  - Applicant management with stage filters (`Applied`, `Shortlisted`, `Interviewed`, `Selected`, `Rejected`) and "Show Eligible Only" filter.
  - **Auto Shortlist Eligible Applicants**: Automatically filters and advances eligible candidates in "Applied" status to "Shortlisted" with a single click.
  - Student directory with branch-wise, roll number, and placement status filtering.
- **Recruiter / Company**:
  - Company profile management (overview, website, contact HR details).
  - Post and manage drives exclusive to their organization.
  - Review verified student applicants and advance candidates through interview rounds.
  - Company-level isolation (recruiters cannot view competitors' drives or candidate lists).

### 2. Automatic Eligibility Engine
The core backend utility (`utils/eligibilityChecker.js`) evaluates candidate qualifications against drive rules:
1. **Drive Status & Deadlines**: Blocks applications to closed drives or expired deadlines.
2. **Institutional Placement Policy**: If a student is already placed (`isPlaced: true`), they are blocked from applying to other Placement drives (internships remain accessible).
3. **Minimum CGPA Threshold**: Verified against current student CGPA.
4. **Eligible Academic Branches**: Matches student branch against allowed branches (e.g., CSE, IT, AIML, ECE, or ALL).
5. **Batch Matching**: Ensures student graduation year matches the drive batch.
6. **Active Backlogs Limit**: Enforces maximum permitted active backlogs.

> **Backend Enforcement**: Eligibility is strictly validated on the server before database write, preventing client-side bypasses.

### 3. Institutional 1-Offer Placement Policy Rule
When an application status is updated to **Selected**:
- Student profile is automatically updated: `isPlaced = true`, `placedCompany = drive.companyName`, `placedRole = drive.role`, `placedPackage = drive.package`.
- The student is immediately blocked from applying to any subsequent placement drives, accompanied by an explanatory notice in their portal.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | Server-side JavaScript execution |
| **Backend Framework** | Express.js (v5) | Modular routing, middleware, and controllers |
| **View Engine** | EJS | Server-Side Rendering (SSR) with reusable partials |
| **Styling & UI** | HTML5, CSS3, Bootstrap 5 | Professional academic navy/slate theme, responsive tables, cards |
| **Database** | MongoDB Atlas / Local MongoDB | NoSQL document database |
| **ODM** | Mongoose (v9) | Schema definitions, compound unique indexes, and validation |
| **Authentication** | express-session + connect-mongo | Stateful, server-side session management |
| **Password Hashing** | bcryptjs | Secure salt-and-hash storage for credentials |
| **Flash Messages** | connect-flash | User feedback alerts across redirects |
| **Charts** | Chart.js | Visualization of branch and company statistics |

---

## 📂 Project Structure

```text
campus-placement-system/
├── app.js                         # Application entrypoint & server configuration
├── package.json                   # Dependencies, project metadata, and npm scripts
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git exclusion rules
├── seed.js                        # Database seeder (Admin, Students, Recruiters, Drives, Applications)
├── test_routes.js                 # Automated system verification test suite
│
├── config/
│   └── db.js                      # MongoDB connection handler
│
├── models/
│   ├── User.js                    # User account schema with bcrypt pre-save hook
│   ├── StudentProfile.js          # Academic, professional, and placement policy attributes
│   ├── Company.js                 # Recruiter organization profile
│   ├── Drive.js                   # Placement/internship drive criteria and scheduling
│   └── Application.js             # Pipeline application state, unique index, and status history
│
├── middleware/
│   ├── authMiddleware.js          # Session validation (isAuthenticated, isGuest)
│   └── roleMiddleware.js          # Role-based route guards (isAdmin, isStudent, isRecruiter)
│
├── utils/
│   ├── eligibilityChecker.js      # Centralized automatic eligibility engine
│   └── profileCompleteness.js     # Student profile completeness percentage calculator
│
├── controllers/
│   ├── authController.js          # Login, student/recruiter registration, session destroy
│   ├── studentController.js       # Student portal, eligibility inspection, application submission
│   ├── adminController.js         # Placement cell dashboard, drive CRUD, applicants, auto-shortlist
│   └── recruiterController.js     # Recruiter campaigns, company profile, candidate stage updates
│
├── routes/
│   ├── authRoutes.js              # /login, /register/student, /register/recruiter, /logout
│   ├── studentRoutes.js           # /student/* guarded routes
│   ├── adminRoutes.js             # /admin/* guarded routes
│   └── recruiterRoutes.js         # /recruiter/* guarded routes
│
├── views/
│   ├── partials/
│   │   ├── navbar.ejs             # Role-aware responsive navigation
│   │   ├── footer.ejs             # Academic footer
│   │   ├── alerts.ejs             # Bootstrap dismissible alert banner
│   │   ├── studentSidebar.ejs     # Student portal sidebar navigation
│   │   ├── adminSidebar.ejs       # Admin portal sidebar navigation
│   │   └── recruiterSidebar.ejs   # Recruiter portal sidebar navigation
│   ├── auth/
│   │   ├── login.ejs              # Unified login page with demo credentials helper
│   │   ├── registerStudent.ejs    # Student registration form
│   │   └── registerRecruiter.ejs  # Recruiter company registration form
│   ├── student/
│   │   ├── dashboard.ejs          # Student dashboard & recommended opportunities
│   │   ├── profile.ejs            # Profile view/edit with completeness meter
│   │   ├── drives.ejs             # Filterable drives list with eligibility badges
│   │   ├── driveDetail.ejs        # Drive description, comparison table, Apply button
│   │   ├── applications.ejs       # Applications tracker with visual pipeline stepper
│   │   └── placementStatus.ejs    # Official institutional placement status notice
│   ├── admin/
│   │   ├── dashboard.ejs          # Placement cell analytics, metrics, and Chart.js graphs
│   │   ├── students.ejs           # Filterable student directory
│   │   ├── drives.ejs             # Drives management table
│   │   ├── driveCreate.ejs        # Create recruitment drive form
│   │   ├── driveEdit.ejs          # Edit recruitment drive form
│   │   ├── applicants.ejs         # Applicant review table & Auto-Shortlist button
│   │   └── analytics.ejs          # Branch-wise and company-wise placement reports
│   ├── recruiter/
│   │   ├── dashboard.ejs          # Recruiter overview & candidate streams
│   │   ├── profile.ejs            # Company profile form
│   │   ├── drives.ejs             # Company campaigns list
│   │   ├── driveCreate.ejs        # Post new drive form
│   │   └── applicants.ejs         # Candidate round stage management
│   ├── index.ejs                  # Landing page with live portal statistics
│   ├── 403.ejs                    # Forbidden / access denied view
│   ├── 404.ejs                    # Page not found view
│   └── 500.ejs                    # Internal server error view
│
└── public/
    ├── css/
    │   └── styles.css             # Navy/slate design system, pipeline badges, cards
    ├── js/
    │   └── main.js                # Confirmation prompts, drive type toggles, tooltips
    └── images/
        └── logo.svg               # Institutional placement portal crest
```

---

## ⚙️ Installation & Local Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd web_2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/campus_placement
SESSION_SECRET=campus_placement_secure_session_secret_2026_dev
```

> **Using MongoDB Atlas?**  
> Replace `MONGODB_URI` with your connection string:  
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus_placement?retryWrites=true&w=majority`

### 4. Populate Demo / Sample Data
Run the database seeder to create sample accounts, drives, and applications:
```bash
npm run seed
```

### 5. Run Automated Tests
Verify all 16 requirements and features:
```bash
npm test
```

### 6. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Visit the application in your browser:
**`http://localhost:3000`**

---

## 🔑 Demo Credentials (Ready for Viva Demonstration)

| Role | Email | Password | Description / Test Scenario |
| :--- | :--- | :--- | :--- |
| **Admin / Placement Officer** | `admin@placement.edu` | `Admin@123` | Full access to manage drives, students, auto-shortlist, and analytics |
| **Student (Unplaced)** | `student@placement.edu` | `Student@123` | **Arjun Sharma** (CSE, CGPA 8.4, 0 backlogs) &mdash; Ready to test Apply flow |
| **Student (Placed)** | `priya.patel@placement.edu` | `Student@123` | **Priya Patel** (Placed at Microsoft, ₹18.5 LPA) &mdash; Tests Placement Policy block |
| **Student (Low CGPA)** | `ananya.sen@placement.edu` | `Student@123` | **Ananya Sen** (CGPA 6.45) &mdash; Demonstrates CGPA cutoff ineligibility |
| **Recruiter (Google)** | `recruiter@company.com` | `Recruiter@123` | Recruiter portal for Google India drives & applicants |
| **Recruiter (Microsoft)** | `recruiter@microsoft.com` | `Recruiter@123` | Recruiter portal for Microsoft drives & applicants |
| **Recruiter (TCS)** | `recruiter@tcs.com` | `Recruiter@123` | Recruiter portal for TCS drives & applicants |

---

## 🎓 Academic Viva Questions & Answers (Assignment 2 Guide)

### Q1: Why did you choose Server-Side Rendering (SSR) with EJS over a Single Page Application (SPA)?
**Answer**: EJS server-side rendering simplifies the application architecture for an academic project by keeping routing, authorization, and rendering on the server. There is no need for client-side state managers (Redux) or separate API layers, which eliminates synchronization issues and reduces latency for initial page loads.

### Q2: How does the Automatic Eligibility Filter work?
**Answer**: Eligibility is evaluated via a shared utility function (`utils/eligibilityChecker.js`). When a student views a drive, the function checks:
1. Drive status (`Active` vs `Closed`) and deadline date.
2. Placement Policy: If the student is already placed (`isPlaced: true`) and the drive is a `Placement`, they are marked ineligible.
3. Minimum CGPA threshold (`student.cgpa >= drive.minCGPA`).
4. Eligible branches (`drive.eligibleBranches.includes(student.branch)` or `ALL`).
5. Graduation batch matching.
6. Maximum allowed backlogs (`student.activeBacklogs <= drive.maxBacklogs`).

The exact same check is enforced on the server inside `applyDrive` before saving an application, ensuring that clients cannot bypass checks by modifying the frontend DOM.

### Q3: How do you prevent duplicate applications?
**Answer**: Duplicate prevention is enforced at two levels:
1. **Application Logic**: The controller checks `Application.findOne({ student: profileId, drive: driveId })` before creating a new record.
2. **Database Integrity**: The Mongoose schema defines a compound unique index:
   `applicationSchema.index({ student: 1, drive: 1 }, { unique: true });`
   This guarantees that even under race conditions, MongoDB will reject duplicate applications.

### Q4: How is the Placement Policy (1-Offer Rule) enforced?
**Answer**: When an applicant's status transitions to `Selected` for a Placement drive (via admin or recruiter action), a hook updates the student's profile:
- `student.isPlaced = true`
- `student.placedCompany = drive.companyName`
- `student.placedRole = drive.role`
- `student.placedPackage = drive.package`
Once `isPlaced` is `true`, the eligibility checker automatically blocks the student from applying to any subsequent `Placement` drives, while keeping `Internship` drives accessible for learning.

### Q5: How is user authentication and role security implemented?
**Answer**: Passwords are never stored as plain text; they are hashed with `bcryptjs` using a salt work factor of 10 during the Mongoose `pre('save')` hook. Sessions are managed using `express-session` with MongoDB session storage (`connect-mongo`). Role-based access control is enforced via Express middleware (`isAdmin`, `isStudent`, `isRecruiter`). If an unauthorized user attempts to access an endpoint, they receive an HTTP 403 Forbidden response.

---

## 🌐 Deployment Instructions (Render / AWS)

### Deploying to Render
1. Push your repository to GitHub.
2. On [Render](https://render.com), create a new **Web Service** and connect your GitHub repository.
3. Configure the service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `3000` (or leave default assigned by Render)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `SESSION_SECRET`: A secure random secret string
5. Click **Deploy Web Service**.
6. (Optional) Run `npm run seed` via the Render Shell tab to populate demo accounts.

---

## 🔮 Future Enhancements
- Automated email / SMS alerts on status transitions (Shortlisted, Interview rounds).
- Resume parser using AI/NLP to automatically extract and populate skills.
- Export student placement reports to PDF and Excel format for college accreditation (NAAC / NBA).
- Company feedback and interview rating rubrics for placement drives.
