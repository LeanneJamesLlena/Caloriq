import express from 'express'
import { verifyAccess } from '../middleware/auth.js';
import { getMyTargets, putMyTargets }from '../controllers/profile.controller.js';

const router = express.Router();

//GET /api/profile/targets 
router.get('/targets', verifyAccess, getMyTargets); //tested and working
//PUT /api/profile/targets 
router.put('/targets', verifyAccess, putMyTargets); //tested and working


export default router;