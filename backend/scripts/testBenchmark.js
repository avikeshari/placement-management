const fs=require('fs');const path=require('path');const root=path.join(__dirname,'..');
const frontend=path.join(root,'..','frontend');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const readFront=f=>fs.readFileSync(path.join(frontend,f),'utf8');
const exists=f=>fs.existsSync(path.join(root,f)); const existsFront=f=>fs.existsSync(path.join(frontend,f));
let pass=0,fail=0; const check=(n,c)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n)}};
[
'models/Notification.js','models/SavedJob.js','models/SavedSearch.js','models/CompanyFollow.js','models/CandidateNote.js','models/AuditLog.js','models/CareerEvent.js','models/SavedCandidate.js',
'controllers/notificationController.js','controllers/savedJobController.js','controllers/savedSearchController.js','controllers/companyFollowController.js','controllers/candidateSearchController.js','controllers/careerEventController.js','controllers/auditLogController.js','controllers/savedCandidateController.js',
'routes/notificationRoutes.js','routes/savedJobRoutes.js','routes/savedSearchRoutes.js','routes/companyFollowRoutes.js','routes/candidateSearchRoutes.js','routes/careerEventRoutes.js','routes/auditLogRoutes.js','routes/savedCandidateRoutes.js',
'utils/jobMatcher.js','utils/jobAlertService.js'
].forEach(f=>check(`Backend module exists: ${f}`,exists(f)));
['src/pages/student/SavedJobs.jsx','src/pages/student/SavedSearches.jsx','src/pages/student/Notifications.jsx','src/pages/student/Events.jsx','src/pages/student/CareerResources.jsx','src/pages/student/PrivacySettings.jsx','src/pages/company/TalentSearch.jsx','src/pages/company/SavedCandidates.jsx','src/pages/company/CompanyProfile.jsx','src/pages/company/Notifications.jsx','src/pages/admin/Verification.jsx','src/pages/admin/Events.jsx','src/pages/admin/AuditLogs.jsx','src/components/NotificationBell.jsx','src/components/ProfileVisibility.jsx','src/components/JobMatchBadge.jsx','src/components/EventCard.jsx'].forEach(f=>check(`Frontend module exists: ${f}`,existsFront(f)));
const app=readFront('src/App.jsx');
['/student/saved-jobs','/student/saved-searches','/student/events','/student/notifications','/student/resources','/student/settings','/company/talent','/company/saved-candidates','/company/notifications','/admin/verification','/admin/events','/admin/audit-logs'].forEach(r=>check(`React route exists: ${r}`,app.includes(r)));
const server=read('server.js');
['/api/notifications','/api/saved-jobs','/api/saved-searches','/api/company-follows','/api/candidate-search','/api/career-events','/api/audit-logs','/api/saved-candidates'].forEach(r=>check(`API route registered: ${r}`,server.includes(r)));
check('Saved candidate controller persists company/student pair',read('controllers/savedCandidateController.js').includes('findOneAndUpdate')&&read('models/SavedCandidate.js').includes('unique'));
check('Job matcher exports transparent score',read('utils/jobMatcher.js').includes('calculateJobMatch')&&read('utils/jobMatcher.js').includes('score'));
check('Job alert service exists',read('utils/jobAlertService.js').includes('alertForJob'));
check('Calendar export UI exists',readFront('src/pages/student/Events.jsx').includes('text/calendar'));
check('Student drives route remains present',app.includes('/student/drives'));


[
'src/pages/student/resources/ResourceSources.jsx','src/pages/student/resources/ResumePreparation.jsx','src/pages/student/resources/InterviewPreparation.jsx','src/pages/student/resources/PlacementChecklist.jsx','src/pages/student/resources/ProfessionalCommunication.jsx'
].forEach(f=>check(`Career resource page exists: ${f}`,existsFront(f)));
['/student/resources/resume','/student/resources/interview','/student/resources/checklist','/student/resources/communication'].forEach(r=>check(`Career resource React route exists: ${r}`,app.includes(r)));
check('Career resources hub links to four dedicated sections',readFront('src/pages/student/CareerResources.jsx').includes('/student/resources/resume')&&readFront('src/pages/student/CareerResources.jsx').includes('/student/resources/interview')&&readFront('src/pages/student/CareerResources.jsx').includes('/student/resources/checklist')&&readFront('src/pages/student/CareerResources.jsx').includes('/student/resources/communication'));
check('Placement checklist reads actual profile and academic data',readFront('src/pages/student/resources/PlacementChecklist.jsx').includes('api.get("/profile/me")')&&readFront('src/pages/student/resources/PlacementChecklist.jsx').includes('api.get("/academic/me")'));
check('Placement checklist reads applications and interviews',readFront('src/pages/student/resources/PlacementChecklist.jsx').includes('api.get("/applications/my")')&&readFront('src/pages/student/resources/PlacementChecklist.jsx').includes('api.get("/interviews/my")'));
check('Placement checklist reads placement drives',readFront('src/pages/student/resources/PlacementChecklist.jsx').includes('api.get("/drives")')&&readFront('src/pages/student/resources/PlacementChecklist.jsx').includes('isParticipant'));
check('Career resource pages provide external source links', ['ResumePreparation.jsx','InterviewPreparation.jsx','ProfessionalCommunication.jsx','PlacementChecklist.jsx'].every(f=>readFront(`src/pages/student/resources/${f}`).includes('ResourceSources')));
check('Frontend package declares ES module type',readFront('package.json').includes('"type": "module"'));

check("Reports disable only the active download button", !readFront("src/pages/admin/Reports.jsx").includes('disabled={loading !== ""}'));
check("Reports keep non-active buttons enabled", readFront("src/pages/admin/Reports.jsx").includes('disabled={loading === type}'));
check("Student saved jobs use canonical API route", readFront("src/pages/student/SavedJobs.jsx").includes('api.get("/saved-jobs")'));
check("Student saved searches use canonical API route", readFront("src/pages/student/SavedSearches.jsx").includes("api.get('/saved-searches')"));
check("Student events use canonical API route", readFront("src/pages/student/Events.jsx").includes('api.get("/career-events")'));
check("Student notifications use canonical API route", readFront("src/pages/student/Notifications.jsx").includes('api.get("/notifications")'));
check("Company talent uses canonical API route", readFront("src/pages/company/TalentSearch.jsx").includes("api.get('/candidate-search'"));
check("Company saved candidates use canonical API route", readFront("src/pages/company/SavedCandidates.jsx").includes("api.get('/saved-candidates')"));
check("Company notifications use canonical API route", readFront("src/pages/company/Notifications.jsx").includes("api.get('/notifications')"));
check("Admin verification uses admin API route", readFront("src/pages/admin/Verification.jsx").includes("/admin/companies/"));
check("Admin events use canonical API route", readFront("src/pages/admin/Events.jsx").includes("api.get('/career-events')"));
check("Admin drives validate end after start", readFront("src/pages/admin/Drives.jsx").includes('new Date(form.endAt)<=new Date(form.startAt)'));
check("Admin verification route is registered", read('routes/adminRoutes.js').includes('router.patch("/companies/:id/verification", verifyCompany)'));
check("Demo career event is seeded", read("scripts/seedDemoUsers.js").includes("Demo Career Fair"));
check("Demo placement drive is seeded", read("scripts/seedDemoUsers.js").includes("Demo Placement Drive"));
console.log(`\nPassed: ${pass}\nFailed: ${fail}`);process.exitCode=fail?1:0;
