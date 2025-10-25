// Verify access token for protected routes
// Helper to read refresh cookie safely
import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { config } from '../config/env.js';
import { User } from '../models/User.model.js';

export function verifyAccess(req, res, next) {
    //read the authorization header, because access token is attached there
    const header = req.headers.authorization || '';
    //extract/get the token
    const [, token] = header.split(' ');
    if (!token) {
        return res.status(401).json({ error: 'Missing access token' });
    }

    try {
        //verify the token
        const payload = verifyAccessToken(token);
        req.user = { id: payload.sub, email: payload.email, tv: payload.tv };
        //everythings good then continue , call next middleware or route handler
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired access token' });
    }

}

export async function readAndValidateRefresh(req, res, next) {
    //read refresh token from cookie, because refresh token stored in a cookie, while access token in the header
    const token = req.cookies?.[config.COOKIE_NAME];
    if (!token) {
        return res.status(401).json({ error: 'No refresh token' });
    }
    try {
        //verify refreshtoken
        const payload = verifyRefreshToken(token);
        // Check tokenVersion still matches DB (prevents reused/old refresh tokens)
        const user = await User.findById(payload.sub).select('email tokenVersion');
        if (!user || user.tokenVersion !== payload.tv) {
        return res.status(401).json({ error: 'Refresh token revoked' });
        }
        req.user = { id: String(user._id), email: user.email, tv: user.tokenVersion };
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
}
