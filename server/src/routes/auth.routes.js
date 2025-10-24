import express from 'express'
//import the logics of the routes
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { verifyAccess, readAndValidateRefresh } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', readAndValidateRefresh, refresh);
router.post('/logout', logout);


// temporary protected route to test access tokens
// router.get('/me', verifyAccess, me);
export default router;