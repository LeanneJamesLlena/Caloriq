import express from 'express'
//import the logics of the routes
import { register, login, refresh, logout, me } from '../controllers/auth.controller.js';
import { verifyAccess, readAndValidateRefresh } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register); //tested and working
router.post('/login', login); //tested and working
router.post('/refresh', readAndValidateRefresh, refresh); //? trying to see if this works
router.post('/logout', logout); //?

//WHEN EVERYTHING WORKS SAFE TO FINAL COMMIT AND PUSH
// TEMPORARY PROTECTTED route to test access tokens
router.get('/me', verifyAccess, me);
export default router;