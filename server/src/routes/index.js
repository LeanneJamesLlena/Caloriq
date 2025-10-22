 // mounts sub-routers
 // inside app.js we will mount all the routes that starts with /api -> app.use('/api', allRoutes), allRoutes will be the import of this file in the app.js and this file will export the router we will use to create routes.
 // this file will mount all the sub routers such as auth, diary, foods, profile. 
import express from 'express'
import authRoutes from './auth.routes.js'
import diaryRoutes from './diary.routes.js'
import foodsRoutes from './foods.routes.js'
import profileRoutes from './profile.routes.js'

const router = express.Router()
// from app.js to here we will be mounting all subroutes starts with either one of those path to the right route
//for example /api/auth path will be handled by authRoutes and /api/foods by foodsRoutes etc..
router.use('/auth', authRoutes);
router.use('/diary', diaryRoutes);
router.use('/foods', foodsRoutes);
router.use('/profile', profileRoutes);



export default router;