import express from 'express'
import { testGetProfileRoute }from '../controllers/profile.controller.js'
const router = express.Router();


router.get('/', testGetProfileRoute);



export default router;