import express from 'express'
import { testGetAuthRoute }from '../controllers/auth.controller.js'
const router = express.Router();


router.get('/', testGetAuthRoute);



export default router;