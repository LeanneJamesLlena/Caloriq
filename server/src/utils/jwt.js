import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';


// Sign the access token
// we are signing the access token using jwt package it has in built function called sign, takes 3 parameters such as payload, the secret of the access token that we created inside .env and object, define properties such as algorithm we will be using to sign the token, expiresIn, duration of the access token
export const signAccessToken = (payload) => {
    try {
        return jwt.sign(payload, config.JWT_ACCESS_SECRET, { 
            algorithm: 'HS256',
            expiresIn: config.ACCESS_TOKEN_EXPIRES,
        });
    
    } catch (error) {
        console.error('Error signing access token:', error);
        throw new Error('Failed to sign access token');
        
    }
}

//Sign the refresh token, same process as signing access token
export const signRefreshToken = (payload) => {
    try {
        return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
            algorithm: 'HS256',
            expiresIn: config.REFRESH_TOKEN_EXPIRES,
        });
    } catch (error) {
        console.error('Error signing refresh token:', error);
        throw new Error('Failed to sign refresh token');
        
    }
}

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch (error) {
        console.warn('Invalid or expired access token');
        throw new Error('Invalid access token');
    }
}

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
        console.warn('Invalid or expired refresh token');
        throw new Error('Invalid refresh token');
    }
}