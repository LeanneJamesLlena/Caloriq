// Authentication logics
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// Sign and create the access token
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
};

// Sign and create the refresh token
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
};

// Verify access token
export const verifyAccessToken = (accessToken) => {
    try {
        // returns the decoded payload
        return jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    } catch (error) {
        console.warn('Invalid or expired access token');
        throw new Error('Invalid access token');
    }
};

// Verify refresh token
export const verifyRefreshToken = (refreshToken) => {
    try {
        // returns the decoded payload
        return jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
        console.warn('Invalid or expired refresh token');
        throw new Error('Invalid refresh token');
    }
};
