import express from 'express'
//import the logics of the routes
import { register, login, refresh, logout, me } from '../controllers/auth.controller.js';
import { verifyAccess, readAndValidateRefresh } from '../middleware/auth.js';

const router = express.Router();
//POST /api/auth/register
router.post('/register', register); //tested and working
//POST /api/auth/login
router.post('/login', login); //tested and working
//POST /api/auth/refresh
router.post('/refresh', readAndValidateRefresh, refresh); //tested and working
//POST /api/auth/logout
router.post('/logout', logout); //tested and working

// TEMPORARY PROTECTTED ROUTE to test access tokens
router.get('/me', verifyAccess, me);
export default router;

