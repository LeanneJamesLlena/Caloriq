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

export async function register(req, res) {
    try {
        //get user's email and password from the request body
        const { email, password } = req.body;
        // PASS THE ARGUMENTS AS OBJECT PROPERTIES
        // MUCH BETTER BECAUSE IN THIS WAY ORDER DOESNT MATTER
        // MEANING THAT password, email or email, password because the function will be using object destructuring
        // email will be save in side email and password will be save inside password
        // second thing is that the argument amount doesnt matter, so if the function is expecting 3 properties and you only pass down an object that contains 2 properties it will still work
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

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        //pass the email and password to verifyUser to check if the user exist with that kind of email and if the given password matches th epassword stored in database
        const user = await verifyUser(email, password);
        //when credentials are valid, give the user access token and refresh token
        const { accessToken, refreshToken } = await signTokens(user);
        //User gets access token and refresh token correctly
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
