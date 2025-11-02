// Verify access token for protected routes
// Helper to read refresh cookie safely
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { config } from '../config/env.js';
import { User } from '../models/User.model.js';

// Verify access of the user by checking if access token is valid
export function verifyAccess(req, res, next) {
    //read the authorization header, because access token is attached there
    const header = req.headers.authorization || '';
    //extract/get the token
    const [, accessToken] = header.split(' ');
    if (!accessToken) {
        return res.status(401).json({ error: 'Missing access token' });
    }

    try {
        //verify the token
        const payload = verifyAccessToken(accessToken);
        // store properties of the user inside req.user
        req.user = { id: payload.sub, email: payload.email, tv: payload.tv };
        //call the route's second function
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired access token' });
    }

}
// read and validate refresh token
export async function readAndValidateRefresh(req, res, next) {
    //search for a cookie named (config.COOKIE_NAME=refreshToken) inside req.cookies
    //?, notation so that if cookie doesnt exist wont crash
    const refreshToken = req.cookies?.[config.COOKIE_NAME];
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token' });
    }
    try {
        //verify refreshtoken
        const payload = verifyRefreshToken(refreshToken);
        // Check tokenVersion still matches DB (prevents reused/old refresh tokens)
        const user = await User.findById(payload.sub).select('email tokenVersion');
        if (!user || user.tokenVersion !== payload.tv) {
            return res.status(401).json({ error: 'Refresh token revoked' });
        }
        // store the verified user info inside req.user so that refresh controller function will have access to it
        req.user = { id: String(user._id), email: user.email, tv: user.tokenVersion };
        // call next(), so the 2nd route function which is "refresh" will be called
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
}
