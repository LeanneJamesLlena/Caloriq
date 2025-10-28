//load all variables inside .env and store inside object config
import dotenv from 'dotenv'
//load .env variables
dotenv.config();
//save .env variables inside object config
export const config = {
    PORT: process.env.PORT || 4000,
    MONGO_URI: process.env.MONGO_URI,


    // JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,

    //Cookies /Cors
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    COOKIE_NAME: process.env.COOKIE_NAME || 'refreshToken',

    //Fdc
    FDC_API_KEY: process.env.FDC_API_KEY,
    FDC_ALLOWED_DATATYPES: process.env.FDC_ALLOWED_DATATYPES || 'Foundation,SR Legacy',

    SUGARS_POLICY: 'respect-zero',

};