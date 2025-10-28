import mongoose from 'mongoose'
import { config } from './env.js'
//CODE FOR EMPTYING foodcache collection:import { FoodCache } from '../models/FoodCache.model.js';


export const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        /* CODE FOR EMPTYING foodcache collection:
        if (process.env.CLEAR_FOOD_CACHE === 'true') {
            const { deletedCount } = await FoodCache.deleteMany({});
            console.log(`[FoodCache] Cleared ${deletedCount} docs`);
        }
        */
        
        console.log(`backend server connected to DATABASE!`)
    } catch (error) {
        console.error(error.message);
    }
}