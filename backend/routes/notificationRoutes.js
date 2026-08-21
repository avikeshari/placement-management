const express=require('express'); const protect=require('../middleware/authMiddleware'); const authorize=require('../middleware/roleMiddleware'); const c=require('../controllers/notificationController'); const r=express.Router();
r.use(protect); r.get('/',c.notifications); r.patch('/:id/read',c.markNotification); module.exports=r;
