// define the logics of the routes inside auth.routes.js
import { config } from '../config/env.js';
import { createUser, verifyUser, signTokens, bumpTokenVersion } from '../services/auth.service.js'

const refreshCookieOptions = {
    httpOnly: true,
    secure: false, // set true in production; for local HTTPS keep true with mkcert; if plain HTTP local, temporarily set false
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

// register the user
export async function register(req, res) {
    try {
        const { email, password } = req.body;
        const user = await createUser({ email, password });
        res.status(201).json({
            message: "User created successfully!",
            id: user._id,
            email: user.email
        });
    } catch (error) {
        res.status(400).json({error: error.message});
        
    }
}
// logs the user in
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await verifyUser(email, password);
        //when credentials are valid, give the user access token and refresh token
        const { accessToken, refreshToken } = await signTokens(user);
        res.cookie(config.COOKIE_NAME, refreshToken, refreshCookieOptions);
        res.json({ accessToken, user: { id: user._id, email: user.email }});
    } catch (error) {
        res.status(401).json({error: error.message || 'invalid credentials' })
    }
}

export async function refresh(req, res) {
    // `readAndValidateRefresh` middleware already put user on req.user
    const userLike = { _id: req.user.id, email: req.user.email, tokenVersion: req.user.tv };
    const { accessToken, refreshToken } = await signTokens(userLike);
    // rotate refresh cookie
    res.cookie(config.COOKIE_NAME, refreshToken, refreshCookieOptions);
    res.json({ accessToken });

}

export async function logout(req, res) {
    // clear cookie when user logsout
    res.clearCookie(config.COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
};

// TEST ROUTE: test route to verify access token,
export async function me(req, res) {
    res.json({ id: req.user.id, email: req.user.email });
}
