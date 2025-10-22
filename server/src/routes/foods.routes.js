import express from 'express'
import { testGetFoodRoute }from '../controllers/foods.controller.js'
const router = express.Router();


router.get('/', testGetFoodRoute);



export default router;