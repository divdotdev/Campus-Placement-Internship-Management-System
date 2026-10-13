import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

process.on("uncaughtException", (error) => {
  console.error("BUILD_ERROR", error?.name, error?.message);
  console.error(error?.stack);
  process.exit(1);
});

const workspaceDir = "/Users/divyanshsmacbook/Desktop/Campus-Placement-Internship-Management-System";
const SKILL_DIR = "/Users/divyanshsmacbook/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.22227/skills/presentations";
const TMP_DIR = path.join(workspaceDir, ".codex-build/presentation");
const FINAL_PPTX = path.join(workspaceDir, "output/Campus_Placement_Internship_Management_System_6_Slides_Final.pptx");
const RUNTIME_PYTHON = "/Users/divyanshsmacbook/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const {
  resolvePresentationFont,
  makeNativeBulletParagraphs,
  finalizePresentation,
} = await import(pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href);

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const FONT = resolvePresentationFont();
const hero = await fs.readFile(path.join(workspaceDir, "assets/presentation/campus-placement-hero.png"));
const logo = await fs.readFile(path.join(workspaceDir, "assets/presentation/logo.svg"));

const C = {
  navy: "#0B1F3A",
  navy2: "#102A4C",
  blue: "#1E3A8A",
  cyan: "#38BDF8",
  cyan2: "#0EA5E9",
  slate: "#334155",
  text: "#142735",
  muted: "#64748B",
  line: "#D6E2EC",
  pale: "#F4F8FC",
  white: "#FFFFFF",
  amber: "#F5B942",
  green: "#10B981",
  red: "#E85D75",
};

const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function addText(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill ?? "none",
    line: opts.line ?? { fill: "none", width: 0 },
    borderRadius: opts.borderRadius,
  });
  shape.text = text;
  shape.text.style = {
    typeface: FONT,
    fontSize: opts.fontSize ?? 24,
    bold: opts.bold ?? false,
    color: opts.color ?? C.text,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.vAlign ?? "top",
    autoFit: opts.autoFit ?? "shrinkText",
    wrap: "square",
    insets: opts.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
    lineSpacing: opts.lineSpacing,
  };
  return shape;
}

function addBox(slide, x, y, w, h, opts = {}) {
  const geometry = opts.geometry ?? "roundRect";
  const config = {
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill ?? C.white,
    line: opts.line ?? { style: "solid", fill: C.line, width: 1 },
    shadow: opts.shadow ?? "shadow-none",
  };
  if (["rect", "textbox", "roundRect"].includes(geometry)) {
    config.borderRadius = opts.borderRadius ?? "rounded-2xl";
  }
  return slide.shapes.add(config);
}

function addHeader(slide, number, title, subtitle) {
  slide.background.fill = C.pale;
  addText(slide, String(number).padStart(2, "0"), 54, 42, 54, 28, {
    fontSize: 17, bold: true, color: C.cyan2, vAlign: "middle",
  });
  addText(slide, title, 112, 35, 1050, 54, {
    fontSize: 43, bold: true, color: C.navy, vAlign: "middle",
  });
  addText(slide, subtitle, 112, 91, 1030, 34, {
    fontSize: 20, color: C.muted, vAlign: "middle",
  });
  const rule = slide.shapes.add({
    geometry: "line",
    position: { left: 54, top: 132, width: 1172, height: 0 },
    fill: "none",
    line: { style: "solid", fill: C.line, width: 1 },
  });
  rule.sendToBack();
  slide.images.add({
    blob: logo,
    contentType: "image/svg+xml",
    alt: "Campus placement portal logo",
    fit: "contain",
    position: { left: 1178, top: 34, width: 46, height: 46 },
  });
}

function addFooter(slide, number) {
  addText(slide, "Campus Placement & Internship Management System", 54, 686, 520, 18, {
    fontSize: 12, color: "#7B8DA1", vAlign: "middle",
  });
  addText(slide, String(number).padStart(2, "0"), 1172, 684, 54, 18, {
    fontSize: 12, bold: true, color: C.muted, align: "right", vAlign: "middle",
  });
}

function addBulletList(slide, items, x, y, w, h, opts = {}) {
  const shape = addText(slide, "", x, y, w, h, {
    fontSize: opts.fontSize ?? 22,
    color: opts.color ?? C.text,
    autoFit: "shrinkText",
    lineSpacing: opts.lineSpacing ?? 1.08,
  });
  shape.text = makeNativeBulletParagraphs(items, {
    marginLeftPoints: 18,
    hangingPoints: 9,
    spaceAfterPoints: opts.spaceAfterPoints ?? 10,
  });
  shape.text.style = {
    typeface: FONT,
    fontSize: opts.fontSize ?? 22,
    color: opts.color ?? C.text,
    autoFit: "shrinkText",
    wrap: "square",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return shape;
}

function addStepNumber(slide, n, x, y, fill = C.blue) {
  const circle = addBox(slide, x, y, 42, 42, {
    geometry: "ellipse",
    fill,
    line: { fill: "none", width: 0 },
    borderRadius: undefined,
  });
  circle.text = String(n);
  circle.text.style = {
    typeface: FONT, fontSize: 19, bold: true, color: C.white,
    alignment: "center", verticalAlignment: "middle", autoFit: "none",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return circle;
}

// Slide 1: Title
{
  const slide = deck.slides.add();
  slide.images.add({
    blob: hero,
    contentType: "image/png",
    alt: "Campus recruitment network connecting students, university and employers",
    fit: "cover",
    position: { left: 0, top: 0, width: 1280, height: 720 },
  });
  slide.images.add({
    blob: logo,
    contentType: "image/svg+xml",
    alt: "Campus placement portal logo",
    fit: "contain",
    position: { left: 72, top: 54, width: 52, height: 52 },
  });
  addText(slide, "COLLEGE PROJECT", 140, 63, 250, 34, {
    fontSize: 17, bold: true, color: C.cyan, vAlign: "middle",
  });
  addText(slide, "Campus Placement &\nInternship Management System", 72, 174, 610, 190, {
    fontSize: 57, bold: true, color: C.white, lineSpacing: 0.92,
  });
  addText(slide, "An automated, role-based portal for campus recruitment", 76, 384, 570, 54, {
    fontSize: 23, color: "#D8EAF7", vAlign: "middle",
  });
  slide.shapes.add({
    geometry: "line",
    position: { left: 76, top: 463, width: 488, height: 0 },
    fill: "none",
    line: { style: "solid", fill: C.cyan, width: 3 },
  });
  addText(slide, "Presented by", 76, 500, 132, 28, { fontSize: 15, bold: true, color: C.cyan });
  addText(slide, "[Your Name]", 76, 531, 250, 36, { fontSize: 23, bold: true, color: C.white });
  addText(slide, "[Branch / Roll No]", 76, 573, 300, 28, { fontSize: 17, color: "#D8EAF7" });
  addText(slide, "[College Name]", 76, 608, 340, 28, { fontSize: 17, color: "#D8EAF7" });
  addText(slide, "6-SLIDE PROJECT OVERVIEW", 1001, 667, 211, 22, {
    fontSize: 11, bold: true, color: "#D8EAF7", align: "right",
  });
  slide.speakerNotes.textFrame.setText(
    "This project presents a centralized platform for managing campus placements and internships from drive creation through final selection. It connects students, recruiters, and the placement cell through one secure and transparent workflow."
  );
}

// Slide 2: Problem and solution
{
  const slide = deck.slides.add();
  addHeader(slide, 2, "Problem statement and proposed solution", "Manual placement operations create delay, inconsistency, and poor visibility");

  addText(slide, "TODAY", 62, 164, 120, 26, { fontSize: 15, bold: true, color: C.red });
  addText(slide, "Fragmented process", 62, 193, 384, 44, { fontSize: 31, bold: true, color: C.navy });
  addBulletList(slide, [
    "Spreadsheets require repeated eligibility checks and manual updates.",
    "Students miss deadlines while recruiters review unsuitable profiles.",
    "Duplicate applications and multiple offers reduce policy fairness.",
    "Placement officers lack a live, college-wide view of outcomes.",
  ], 62, 254, 480, 322, { fontSize: 22, spaceAfterPoints: 14 });

  const sheet = addBox(slide, 620, 178, 170, 154, {
    fill: C.white, line: { style: "solid", fill: "#C9D6E2", width: 1 }, shadow: "shadow-sm",
  });
  addText(slide, "MANUAL", 640, 197, 130, 24, { fontSize: 14, bold: true, color: C.red, align: "center" });
  for (let i = 0; i < 4; i++) {
    slide.shapes.add({ geometry: "line", position: { left: 644, top: 236 + i * 20, width: 122, height: 0 }, fill: "none", line: { style: "solid", fill: "#CBD5E1", width: 1 } });
  }
  for (let i = 0; i < 3; i++) {
    slide.shapes.add({ geometry: "line", position: { left: 675 + i * 30, top: 228, width: 0, height: 72 }, fill: "none", line: { style: "solid", fill: "#E2E8F0", width: 1 } });
  }
  const portal = addBox(slide, 925, 178, 255, 154, {
    fill: C.navy, line: { fill: "none", width: 0 }, shadow: "shadow-md",
  });
  addText(slide, "CENTRAL PORTAL", 947, 196, 212, 24, { fontSize: 14, bold: true, color: C.cyan, align: "center" });
  addText(slide, "One verified source\nof recruitment data", 949, 237, 208, 62, { fontSize: 24, bold: true, color: C.white, align: "center", vAlign: "middle" });
  slide.shapes.connect(sheet, portal, {
    kind: "straight", fromSide: "right", toSide: "left",
    line: { style: "solid", fill: C.cyan2, width: 4 },
    tail: { type: "triangle", width: "med", length: "med" },
  });

  addText(slide, "PROPOSED", 620, 382, 130, 26, { fontSize: 15, bold: true, color: C.green });
  addText(slide, "Centralize the complete cycle", 620, 412, 560, 40, { fontSize: 29, bold: true, color: C.navy });
  addText(slide, "The portal applies one rule set for drive publishing, eligibility, applications, hiring stages, and institutional analytics.", 620, 468, 560, 88, { fontSize: 22, color: C.slate, lineSpacing: 1.12 });
  addText(slide, "Outcome", 620, 586, 88, 24, { fontSize: 14, bold: true, color: C.cyan2 });
  addText(slide, "Less manual work. Clearer decisions. Fairer access.", 714, 580, 470, 34, { fontSize: 21, bold: true, color: C.navy, vAlign: "middle" });
  addFooter(slide, 2);
  slide.speakerNotes.textFrame.setText(
    "Traditional placement drives depend on spreadsheets and repeated manual checks, which increases errors and slows decisions. Our portal centralizes the full recruitment cycle and gives every role the same verified source of information."
  );
}

// Slide 3: Roles and workflow
{
  const slide = deck.slides.add();
  addHeader(slide, 3, "User roles and end-to-end workflow", "Three roles operate inside one controlled recruitment pipeline");

  const roles = [
    { y: 166, code: "ST", name: "Student", note: "Profile, eligibility, application status", fill: "#E8F5FD", accent: C.cyan2 },
    { y: 241, code: "RC", name: "Recruiter", note: "Drives, screening, interviews, offers", fill: "#EEF2FF", accent: C.blue },
    { y: 316, code: "TP", name: "TPO / Admin", note: "Policy, oversight, analytics", fill: "#ECFDF5", accent: C.green },
  ];
  for (const r of roles) {
    addBox(slide, 62, r.y, 296, 58, { fill: r.fill, line: { fill: "none", width: 0 } });
    const badge = addBox(slide, 78, r.y + 9, 40, 40, { geometry: "ellipse", fill: r.accent, line: { fill: "none", width: 0 }, borderRadius: undefined });
    badge.text = r.code;
    badge.text.style = { typeface: FONT, fontSize: 14, bold: true, color: C.white, alignment: "center", verticalAlignment: "middle", autoFit: "none", insets: { top: 0, right: 0, bottom: 0, left: 0 } };
    addText(slide, r.name, 132, r.y + 9, 204, 23, { fontSize: 18, bold: true, color: C.navy, vAlign: "middle" });
    addText(slide, r.note, 132, r.y + 32, 204, 18, { fontSize: 13, color: C.muted, vAlign: "middle" });
  }

  const xs = [424, 622, 820, 1018];
  const stages = [
    { n: 1, title: "Post drive", body: "Recruiter defines role, deadline, branch, CGPA, batch, and backlog limits.", color: C.blue },
    { n: 2, title: "Verify and apply", body: "Student profile is checked against policy before the application is saved.", color: C.cyan2 },
    { n: 3, title: "Advance pipeline", body: "Recruiter or TPO shortlists, schedules interviews, and updates stages.", color: "#6474C8" },
    { n: 4, title: "Select and analyze", body: "Offers update placement status while dashboards show college outcomes.", color: C.green },
  ];
  const stageBoxes = [];
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    const box = addBox(slide, xs[i], 194, 166, 260, { fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, shadow: "shadow-sm" });
    stageBoxes.push(box);
    addStepNumber(slide, s.n, xs[i] + 18, 214, s.color);
    addText(slide, s.title, xs[i] + 18, 274, 130, 42, { fontSize: 23, bold: true, color: C.navy, vAlign: "middle" });
    addText(slide, s.body, xs[i] + 18, 332, 130, 98, { fontSize: 17, color: C.slate, lineSpacing: 1.08 });
  }
  for (let i = 0; i < stageBoxes.length - 1; i++) {
    slide.shapes.connect(stageBoxes[i], stageBoxes[i + 1], {
      kind: "straight", fromSide: "right", toSide: "left",
      line: { style: "solid", fill: "#9FB3C8", width: 2 },
      tail: { type: "triangle", width: "sm", length: "sm" },
    });
  }
  addText(slide, "Unified audit trail", 426, 492, 756, 28, { fontSize: 15, bold: true, color: C.cyan2, align: "center" });
  addText(slide, "Every application stage remains visible to the right users through role-based access and timestamped status history.", 456, 526, 698, 54, { fontSize: 19, color: C.slate, align: "center", vAlign: "middle" });
  addFooter(slide, 3);
  slide.speakerNotes.textFrame.setText(
    "Students, recruiters, and the placement office work in the same pipeline while seeing only the actions allowed for their role. The process starts with a criteria-based drive and ends with a recorded selection plus real-time institutional analytics."
  );
}

// Slide 4: Innovations
{
  const slide = deck.slides.add();
  addHeader(slide, 4, "Key features and innovations", "Policy enforcement and automation reduce repetitive decisions at every stage");

  const core = addBox(slide, 506, 258, 270, 178, { geometry: "ellipse", fill: C.navy, line: { style: "solid", fill: C.cyan, width: 3 }, borderRadius: undefined, shadow: "shadow-md" });
  addText(slide, "POLICY +\nAUTOMATION", 536, 292, 210, 78, { fontSize: 27, bold: true, color: C.white, align: "center", vAlign: "middle" });
  addText(slide, "Shared server-side rules", 552, 377, 178, 24, { fontSize: 15, color: "#BFE8FA", align: "center" });

  const features = [
    { x: 64, y: 176, w: 365, h: 154, n: "01", title: "Automated eligibility engine", body: "Validates drive status, deadline, CGPA, branch, batch, and active backlogs before submission.", color: C.cyan2 },
    { x: 851, y: 176, w: 365, h: 154, n: "02", title: "Fair 1-offer placement policy", body: "A selected student cannot apply to another placement drive, while internships remain available.", color: C.amber },
    { x: 64, y: 436, w: 365, h: 154, n: "03", title: "One-click auto-shortlist", body: "Eligible applicants in the Applied stage advance to Shortlisted through one controlled action.", color: "#6474C8" },
    { x: 851, y: 436, w: 365, h: 154, n: "04", title: "Real-time application tracking", body: "Students follow Applied, Shortlisted, Interviewed, Selected, or Rejected with status history.", color: C.green },
  ];
  const featureBoxes = [];
  for (const f of features) {
    const box = addBox(slide, f.x, f.y, f.w, f.h, { fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, shadow: "shadow-sm" });
    featureBoxes.push(box);
    addText(slide, f.n, f.x + 18, f.y + 18, 52, 30, { fontSize: 16, bold: true, color: f.color });
    addText(slide, f.title, f.x + 76, f.y + 16, f.w - 94, 42, { fontSize: 22, bold: true, color: C.navy, vAlign: "middle" });
    addText(slide, f.body, f.x + 20, f.y + 72, f.w - 40, 62, { fontSize: 17, color: C.slate, lineSpacing: 1.06 });
  }
  slide.shapes.connect(featureBoxes[0], core, { kind: "straight", fromSide: "right", toSide: "left", line: { style: "solid", fill: "#AFC6D8", width: 2 } });
  slide.shapes.connect(featureBoxes[1], core, { kind: "straight", fromSide: "left", toSide: "right", line: { style: "solid", fill: "#AFC6D8", width: 2 } });
  slide.shapes.connect(featureBoxes[2], core, { kind: "straight", fromSide: "right", toSide: "left", line: { style: "solid", fill: "#AFC6D8", width: 2 } });
  slide.shapes.connect(featureBoxes[3], core, { kind: "straight", fromSide: "left", toSide: "right", line: { style: "solid", fill: "#AFC6D8", width: 2 } });
  addFooter(slide, 4);
  slide.speakerNotes.textFrame.setText(
    "The eligibility engine and one-offer rule form the policy core of the system, with the same checks enforced on the server before any database write. Auto-shortlisting saves recruiter time, while stage history gives students immediate visibility into each application."
  );
}

// Slide 5: Architecture
{
  const slide = deck.slides.add();
  addHeader(slide, 5, "System architecture and technology stack", "An MVC web application deployed on Vercel with MongoDB Atlas");

  const client = addBox(slide, 64, 201, 245, 280, { fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, shadow: "shadow-sm" });
  addText(slide, "CLIENT", 88, 222, 196, 26, { fontSize: 14, bold: true, color: C.cyan2, align: "center" });
  addText(slide, "Browser views", 88, 266, 196, 42, { fontSize: 28, bold: true, color: C.navy, align: "center" });
  addText(slide, "EJS server-side templates\nBootstrap 5 responsive UI\nRole-aware navigation", 91, 332, 190, 102, { fontSize: 19, color: C.slate, align: "center", vAlign: "middle", lineSpacing: 1.18 });

  const app = addBox(slide, 390, 164, 500, 358, { fill: C.navy, line: { fill: "none", width: 0 }, shadow: "shadow-md" });
  addText(slide, "APPLICATION LAYER · VERCEL", 418, 186, 444, 26, { fontSize: 14, bold: true, color: C.cyan, align: "center" });
  addText(slide, "Node.js + Express.js", 418, 226, 444, 44, { fontSize: 31, bold: true, color: C.white, align: "center" });
  const layerLabels = [
    { y: 298, title: "Routes + middleware", body: "Session authentication and role guards" },
    { y: 360, title: "Controllers", body: "Drive, application, and status workflows" },
    { y: 422, title: "Models", body: "Mongoose schemas, validation, and unique indexes" },
  ];
  for (const l of layerLabels) {
    addBox(slide, 438, l.y, 404, 48, { fill: "#173A60", line: { style: "solid", fill: "#2B557A", width: 1 }, borderRadius: "rounded-xl" });
    addText(slide, l.title, 455, l.y + 6, 150, 35, { fontSize: 18, bold: true, color: C.white, vAlign: "middle" });
    addText(slide, l.body, 612, l.y + 6, 211, 35, { fontSize: 14, color: "#CDE6F4", vAlign: "middle" });
  }

  const data = addBox(slide, 971, 201, 245, 280, { fill: C.white, line: { style: "solid", fill: C.line, width: 1 }, shadow: "shadow-sm" });
  addText(slide, "DATA", 995, 222, 196, 26, { fontSize: 14, bold: true, color: C.green, align: "center" });
  addText(slide, "MongoDB Atlas", 995, 266, 196, 42, { fontSize: 28, bold: true, color: C.navy, align: "center" });
  addText(slide, "Cloud document database\nMongoose ODM\nCompound index prevents duplicates", 998, 332, 190, 102, { fontSize: 19, color: C.slate, align: "center", vAlign: "middle", lineSpacing: 1.18 });

  slide.shapes.connect(client, app, { kind: "straight", fromSide: "right", toSide: "left", line: { style: "solid", fill: C.cyan2, width: 3 }, tail: { type: "triangle", width: "sm", length: "sm" } });
  slide.shapes.connect(app, data, { kind: "straight", fromSide: "right", toSide: "left", line: { style: "solid", fill: C.green, width: 3 }, tail: { type: "triangle", width: "sm", length: "sm" } });

  addBulletList(slide, [
    "MVC separates view rendering, business rules, and persistent data.",
    "bcryptjs and server-side sessions protect authenticated access.",
  ], 88, 554, 520, 108, { fontSize: 17, spaceAfterPoints: 8 });
  addBulletList(slide, [
    "RESTful routes keep role-specific operations modular.",
    "Vercel hosts the app while Atlas provides managed cloud persistence.",
  ], 662, 554, 520, 108, { fontSize: 17, spaceAfterPoints: 8 });
  addFooter(slide, 5);
  slide.speakerNotes.textFrame.setText(
    "The application follows MVC so presentation, business logic, and data access remain easy to maintain and test. Node.js and Express run the workflows on Vercel, while Mongoose connects the application to MongoDB Atlas and enforces database integrity."
  );
}

// Slide 6: References and acknowledgements
{
  const slide = deck.slides.add();
  addHeader(slide, 6, "References and acknowledgements", "Built from official documentation and real placement-cell operating patterns");

  addText(slide, "Technical references", 64, 174, 520, 40, { fontSize: 29, bold: true, color: C.navy });
  const refs = [
    ["Node.js and Express.js", "nodejs.org/docs  ·  expressjs.com"],
    ["MongoDB Atlas and Mongoose", "mongodb.com/docs/atlas  ·  mongoosejs.com/docs"],
    ["EJS and Bootstrap 5", "ejs.co  ·  getbootstrap.com/docs/5.3"],
    ["Vercel deployment", "vercel.com/docs"],
  ];
  let ry = 231;
  for (let i = 0; i < refs.length; i++) {
    addStepNumber(slide, i + 1, 66, ry + 1, i === 3 ? C.green : C.blue);
    addText(slide, refs[i][0], 126, ry, 440, 25, { fontSize: 19, bold: true, color: C.navy, vAlign: "middle" });
    addText(slide, refs[i][1], 126, ry + 29, 440, 22, { fontSize: 14, color: C.cyan2, vAlign: "middle" });
    ry += 82;
  }

  slide.shapes.add({ geometry: "line", position: { left: 624, top: 174, width: 0, height: 414 }, fill: "none", line: { style: "solid", fill: C.line, width: 1 } });
  addText(slide, "Functional inspiration", 672, 174, 510, 40, { fontSize: 29, bold: true, color: C.navy });
  addBulletList(slide, [
    "University training and placement cell policies for eligibility and offer rules.",
    "Recruitment platforms such as Superset and Handshake for workflow inspiration.",
    "Project requirements and operational scenarios documented in the repository.",
  ], 674, 236, 496, 176, { fontSize: 20, spaceAfterPoints: 12 });

  const thanks = addBox(slide, 672, 445, 498, 143, { fill: C.navy, line: { fill: "none", width: 0 }, shadow: "shadow-sm" });
  addText(slide, "ACKNOWLEDGEMENT", 700, 467, 442, 24, { fontSize: 14, bold: true, color: C.cyan, align: "center" });
  addText(slide, "Thank you", 700, 500, 442, 38, { fontSize: 31, bold: true, color: C.white, align: "center" });
  addText(slide, "[Project Guide] · Faculty Members · Placement Coordinators", 706, 548, 430, 24, { fontSize: 16, color: "#D5E8F4", align: "center" });
  addFooter(slide, 6);
  slide.speakerNotes.textFrame.setText(
    "We used official technology documentation and studied real placement-cell rules plus established recruitment platforms to shape the system. I would like to thank our project guide, faculty members, and placement coordinators for their technical and operational guidance."
  );
}

const requirements = {
  explicitTotalSlideCount: 6,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};
const fontPolicy = { basis: "design", families: [FONT] };
const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "campus-placement-candidate-final.pptx");
await (await PresentationFile.exportPptx(deck)).save(candidatePath);

const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "Campus_Placement_Internship_Management_System_6_Slides_Final.validation.json"),
});

console.log(JSON.stringify({ finalPath: FINAL_PPTX, font: FONT, result }, null, 2));
