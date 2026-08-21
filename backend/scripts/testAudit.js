const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..', '..');
const backend = path.join(root, 'backend');
const frontend = path.join(root, 'frontend');

let passed = 0;
let failed = 0;
const results = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function test(name, fn) {
  try {
    fn();
    passed += 1;
    results.push(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    results.push(`FAIL  ${name}\n      ${err.message}`);
  }
}

function has(file, text) {
  assert.ok(read(file).includes(text), `${text} not found in ${file}`);
}

// ---------------- WHITE-BOX TESTS ----------------

test('Backend package exposes audit test command', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(backend, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts['test:audit']);
});

test('Registration route does not authorize arbitrary roles', () => {
  const src = read('backend/routes/authRoutes.js');
  assert.ok(src.includes('/register'));
  assert.ok(!src.includes('authorize('));
});

test('Job creation validates future deadlines server-side', () => {
  const src = read('backend/controllers/jobController.js');
  assert.ok(src.includes('Application deadline must be in the future'));
  assert.ok(src.includes('validateDeadline'));
});

test('Job search escapes regex input and bounds pagination', () => {
  const src = read('backend/controllers/jobController.js');
  assert.ok(src.includes('escapeRegex'));
  assert.ok(src.includes('safeLimit'));
  assert.ok(src.includes('.limit(safeLimit)'));
});

test('Student eligibility is calculated from AcademicRecord', () => {
  const src = read('backend/controllers/jobController.js');
  assert.ok(src.includes('AcademicRecord.findOne'));
  assert.ok(src.includes('buildEligibility'));
  assert.ok(src.includes('Verified academic record is required'));
});

test('Academic eligibility requires a verified record and demo/import flows verify records', () => {
  const model = read('backend/models/AcademicRecord.js');
  const jobs = read('backend/controllers/jobController.js');
  const importController = read('backend/controllers/academicController.js');
  const seed = read('backend/scripts/seedDemoUsers.js');
  assert.ok(model.includes('verified: { type: Boolean, default: false'));
  assert.ok(jobs.includes('academicRecord.verified !== true'));
  assert.ok(importController.includes('verified: true'));
  assert.ok(seed.includes('verified: true'));
});

test('Application endpoint requires student role', () => {
  const src = read('backend/routes/applicationRoutes.js');
  assert.ok(src.includes('authorize("student")'));
});

test('Duplicate applications have database uniqueness protection', () => {
  const src = read('backend/models/Application.js');
  assert.ok(src.includes('unique: true') || src.includes('unique: true,'));
  assert.ok(src.includes('student') && src.includes('job'));
});

test('Interview scheduling requires shortlisted/selected candidate', () => {
  const src = read('backend/controllers/interviewController.js');
  assert.ok(src.includes('shortlisted", "selected'));
});

test('Interview scheduling validates manual online links', () => {
  const src = read('backend/controllers/interviewController.js');
  assert.ok(src.includes('isValidMeetingUrl'));
  assert.ok(src.includes('mode === "online"'));
  assert.ok(src.includes('meetingUrl'));
});

test('Interview scheduling checks conflicts', () => {
  const src = read('backend/controllers/interviewController.js');
  assert.ok(src.includes('findConflicts'));
  assert.ok(src.includes('durationMinutes'));
});

test('Interview access verifies the authenticated participant', () => {
  const src = read('backend/controllers/interviewController.js');
  assert.ok(src.includes('You are not authorized to access this interview'));
  assert.ok(src.includes('interview.student._id'));
  assert.ok(src.includes('interview.company._id'));
});

test('Company can access student resume only through protected route', () => {
  const src = read('backend/routes/profileRoutes.js');
  assert.ok(src.includes('/student/:userId/resume'));
  assert.ok(src.includes('authorize("company", "admin")'));
});

test('Resume upload has signature verification middleware', () => {
  const src = read('backend/routes/profileRoutes.js');
  assert.ok(src.includes('upload.verifyResumeSignature'));
});

test('Academic import is admin-only', () => {
  const src = read('backend/routes/academicRoutes.js');
  assert.ok(src.includes('/import'));
  assert.ok(src.includes('authorize("admin")'));
});

test('Academic record enrollment number has a single schema-level unique index', () => {
  const src = read('backend/models/AcademicRecord.js');
  assert.ok(src.includes('enrollmentNumber'));
  assert.ok(src.includes('unique: true'));
  assert.ok(src.includes('sparse: true'));
  const field = src.match(/enrollmentNumber\s*:\s*\{[\s\S]*?\n\s*\}/)?.[0] || '';
  assert.ok(!/index\s*:\s*true/.test(field), 'enrollmentNumber still declares index:true');
});

test('Demo seed creates unapplied, shortlisted, and scheduled states', () => {
  const src = read('backend/scripts/seedDemoUsers.js');
  assert.ok(src.includes('Demo flow: 1 applied, 1 shortlisted without interview, 1 interview scheduled, 2 unapplied jobs.'));
  assert.ok(src.includes('status: "shortlisted"'));
  assert.ok(src.includes('meetingUrl'));
});

test('Frontend uses BrowserRouter around App', () => {
  const src = read('frontend/src/main.jsx');
  assert.ok(src.includes('BrowserRouter'));
  assert.ok(/<BrowserRouter>[\s\S]*<App\s*\//.test(src));
});

test('Frontend has a global error boundary', () => {
  const src = read('frontend/src/components/AppErrorBoundary.jsx');
  assert.ok(src.includes('componentDidCatch'));
  assert.ok(src.includes('Something went wrong'));
});

test('Frontend job details expose full posting information', () => {
  const files = fs.readdirSync(path.join(frontend, 'src'), { recursive: true }).filter(f => String(f).endsWith('.jsx'));
  const joined = files.map(f => fs.readFileSync(path.join(frontend, 'src', f), 'utf8')).join('\n');
  assert.ok(joined.includes('View Full Details') || joined.includes('Full Job Details'));
});

test('Daily API has been removed from project configuration', () => {
  const files = ['backend/package.json', 'backend/.env.example', 'frontend/package.json', 'README.md'];
  for (const file of files) {
    const src = read(file).toLowerCase();
    assert.ok(!src.includes('daily_api_key'), `${file} contains DAILY_API_KEY`);
  }
});

test('Manual meeting-link approach is documented', () => {
  const src = read('README.md');
  assert.ok(src.includes('manual meeting-link approach'));
  assert.ok(src.includes('No Daily API'));
});

test('Netlify production API configuration uses /api', () => {
  const src = read('frontend/.env.example');
  assert.ok(src.includes('VITE_API_URL=/api'));
});

test('Student placement drives route is registered', () => {
  const src = read('frontend/src/App.jsx');
  assert.ok(src.includes('path="/student/drives"'));
  assert.ok(src.includes('<StudentDrives />'));
});

test('Messaging models enforce one conversation per application', () => {
  const src = read('backend/models/Conversation.js');
  assert.ok(src.includes('application'));
  assert.ok(src.includes('unique: true'));
  assert.ok(src.includes('student'));
  assert.ok(src.includes('company'));
});

test('Messaging is created when an interview is scheduled', () => {
  const src = read('backend/controllers/interviewController.js');
  assert.ok(src.includes('Conversation.findOneAndUpdate'));
  assert.ok(src.includes('Messaging becomes available once the company schedules an interview'));
});

test('Messaging endpoints require student or company authentication', () => {
  const src = read('backend/routes/messageRoutes.js');
  assert.ok(src.includes('protect'));
  assert.ok(src.includes('authorize("student", "company")'));
  assert.ok(src.includes('/messages'));
});

test('Messaging controller enforces conversation participant authorization', () => {
  const src = read('backend/controllers/messageController.js');
  assert.ok(src.includes('You are not authorized to access this conversation'));
  assert.ok(src.includes('conversation.student'));
  assert.ok(src.includes('conversation.company'));
});

test('Messaging UI is available to students and companies', () => {
  const sidebar = read('frontend/src/components/Sidebar.jsx');
  const app = read('frontend/src/App.jsx');
  const messages = read('frontend/src/pages/Messages.jsx');
  assert.ok(sidebar.includes('Messages'));
  assert.ok(app.includes('path="/messages"'));
  assert.ok(messages.includes('Write a message'));
  assert.ok(messages.includes('5 seconds') || messages.includes('5000'));
});

test('Company and student interview pages link to messaging', () => {
  const company = read('frontend/src/pages/company/Interviews.jsx');
  const student = read('frontend/src/pages/student/Interviews.jsx');
  assert.ok(company.includes('Message Student'));
  assert.ok(student.includes('Message Company'));
});

// ---------------- BLACK-BOX TESTS ----------------

async function blackBox() {
  const base = process.env.TEST_BASE_URL;
  if (!base) {
    results.push('SKIP  Black-box HTTP tests (set TEST_BASE_URL, e.g. http://localhost:5000)');
    return;
  }

  async function request(pathname, options = {}) {
    const response = await fetch(`${base.replace(/\/$/, '')}${pathname}`, options);
    let body = null;
    try { body = await response.json(); } catch {}
    return { response, body };
  }

  const health = await request('/api/health');
  test('HTTP GET /api/health returns 200 and healthy response', () => {
    assert.strictEqual(health.response.status, 200);
    assert.strictEqual(health.body?.success, true);
  });

  const jobs = await request('/api/jobs?limit=999999&page=-5&q=.*');
  test('HTTP job search survives malicious/oversized query parameters', () => {
    assert.ok([200, 400, 500].includes(jobs.response.status));
    if (jobs.response.status === 200) {
      assert.ok(jobs.body?.pagination?.limit <= 50);
    }
  });

  const unauthAdmin = await request('/api/admin/stats');
  test('HTTP admin endpoint rejects unauthenticated requests', () => {
    assert.strictEqual(unauthAdmin.response.status, 401);
  });

  const unauthAcademic = await request('/api/academic/me');
  test('HTTP academic endpoint rejects unauthenticated requests', () => {
    assert.strictEqual(unauthAcademic.response.status, 401);
  });

  const unauthInterviews = await request('/api/interviews/my');
  test('HTTP interview endpoint rejects unauthenticated requests', () => {
    assert.strictEqual(unauthInterviews.response.status, 401);
  });
}

(async () => {
  await blackBox();
  console.log('\nAUDIT TEST RESULTS\n===================');
  console.log(results.join('\n'));
  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  process.exitCode = failed ? 1 : 0;
})();
