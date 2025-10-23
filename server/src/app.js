// builds the Express app (middleware, routes)
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { config } from './config/env.js';
const app = express();


// SECURITY & PARSING MIDDLEWARESS
// Parse JSON bodies into javascript object and store in the req.body
app.use(express.json());

// Parse URL-encoded form data (e.g. from HTML forms) and store in the req.body
app.use(express.urlencoded({ extended: false }));

// Parse cookies so we can read tokens from req.cookies., when the user logs in they get access token and refreshtoken and usually stored inside cookie, and by default when cookie is sent to backend express doesnt have any concept about it cookieParser helps.
app.use(cookieParser());

// Add secure HTTP headers (prevents XSS, clickjacking, etc.)
app.use(helmet());

// use CORS to allow frontend (React on localhost:5173) to talk to backend API
app.use(cors({
  origin: config.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true, // allow cookies and auth headers
}));

// Limit repeated requests (helps prevent brute force or spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP to 100 requests per window
});
app.use(limiter);



// ROUTES
// Mount all API routes under /apii
app.use('/api', routes);


//route error handlers
app.use((req, res) => {
    //this will handle error, 404 status used for not found, so if route not found then usethis response
    res.status(404).json({message: "route not found"});
})

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({error: "Server error"});
})

export default app;
