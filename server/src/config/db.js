import mongoose from 'mongoose'
import { config } from './env.js'

export const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log(`backend server connected to DATABASE!`)
    } catch (error) {
        console.error(error.message);
    }
}