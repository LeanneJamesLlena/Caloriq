import express from 'express'
import { testGetDiaryRoute }from '../controllers/diary.controller.js'
const router = express.Router();


router.get('/', testGetDiaryRoute);



export default router;