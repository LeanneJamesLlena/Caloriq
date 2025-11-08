import mongoose from 'mongoose'
import { config } from './env.js'
/*
CODE FOR EMPTYING database collections such as foodcache and diary entries:
import { FoodCache } from '../models/FoodCache.model.js';
import { DiaryEntry } from '../models/DiaryEntry.model.js';
import { User } from '../models/User.model.js';
*/


export const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        /* CODE FOR EMPTYING foodcaches collection:
        if (process.env.CLEAR_FOOD_CACHES === 'true') {
            const { deletedCount } = await FoodCache.deleteMany({});
            console.log(`[FoodCache] Cleared ${deletedCount} docs`);
        }
        */

        /* CODE FOR EMPTYING diaryentries collection:
        if (process.env.CLEAR_DIARY_ENTRIES === 'true') {
            const { deletedCount } = await DiaryEntry.deleteMany({});
            console.log(`[Diary entires] Cleared ${deletedCount} docs`);
        }

        if (process.env.CLEAR_USERS === 'true') {
            const { deletedCount } = await User.deleteMany({});
            console.log(`[Users] Cleared ${deletedCount} docs`);
        }
        */

        
        console.log(`backend server connected to DATABASE!`)
    } catch (error) {
        console.error(error.message);
    }
}