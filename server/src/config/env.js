//load all variables inside .env and store inside object config
import dotenv from 'dotenv'
//load .env variables
dotenv.config();
//save .env variables inside object config
export const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI

}