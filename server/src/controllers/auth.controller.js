// define the logics of the routes inside auth.routes.js
import { config, isProduction } from '../config/env.js';
import { createUser, verifyUser, signTokens, bumpTokenVersion } from '../services/auth.service.js'

// defines how the cookie behaves
const refreshCookieOptions = {
    httpOnly: true, // cannot be read by JavaScript
    secure: isProduction, // will be https in production. Therefore has to be set true
    sameSite: 'lax', // when in production, domain will be different so 'none' right value
    path: '/',   //  available for all routes on the domain
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
        //verify the user
        const user = await verifyUser(email, password);
        //when credentials are valid, give the user access token and refresh token
        const { accessToken, refreshToken } = await signTokens(user);
        //NOTE! process of returning back the access token and refresh token differs
        /*REFRESH TOKEN:
         1. refresh token will be sent in a secure set cookie header to the client using the extension .cookie
         2. browser will then automatically store refresh token in HTTP only cookie
         3. each time client makes request, refresh token will automatically be included
        */
        /*
         to build set cookie header three parameters: cookiename(refresh token), value to be stored in the cookie and -
         cookie settings that define the cookie's behavior
        */
        res.cookie(config.COOKIE_NAME, refreshToken, refreshCookieOptions);
        /*ACCESS TOKEN:
          Access token will be returned as json formatted data for immediate use
          Frontend needs to manually include access token in Authorization header in every request if needed
        */
        res.json({ accessToken, user: { id: user._id, email: user.email }});
    } catch (error) {
        res.status(401).json({error: error.message || 'invalid credentials' })
    }
}
// gives new access and refresh token
export async function refresh(req, res) {
    // `readAndValidateRefresh` middleware already put user on req.user
    const userLike = { _id: req.user.id, email: req.user.email, tokenVersion: req.user.tv };
    // create new access token and refresh token
    const { accessToken, refreshToken } = await signTokens(userLike);
    // replace the existing refresh token inside http cookie only
    res.cookie(config.COOKIE_NAME, refreshToken, refreshCookieOptions);
    // sends back new access token
    res.json({ accessToken });

}
// logs the user out
export async function logout(req, res) {
    // clear cookie when user logsout
    res.clearCookie(config.COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
};

// TEST ROUTE: test route to verify access token,
export async function me(req, res) {
    res.json({ id: req.user.id, email: req.user.email });
}
