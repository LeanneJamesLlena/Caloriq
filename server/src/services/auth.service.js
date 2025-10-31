//Auth controller's helper functions
import bcrypt from 'bcrypt';
import { User } from '../models/User.model.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';

// Creates new user
export async function createUser({ email, password }) {
    const existing = await User.findOne({
        email: email
    })
    if (existing) {
        throw new Error('Email is already registered');
    }
    // hash the password using bcrypt inbuilt function .hash (never save the password in DB as string)
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        email: email,
        passwordHash: passwordHash,
    });
    return newUser;
}

// Verify that user exist in database and password correct
export async function verifyUser(email, password) {
    const user = await User.findOne({
        email: email,
    })
    if (!user) {
        throw new Error('Invalid credentials');
    };
    // using bcrypt inbuilt function .compare allows us to compare a string value and hash value
    const passwordMatched = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatched) {
        throw new Error('Invalid credentials');
    }
    return user;
}

// Returns back created and signed access and refresh token
export async function signTokens(user) {
    //build the payload
    const payload = {
        sub: String(user._id),
        email: user.email,
        tv: user.tokenVersion,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    return { accessToken, refreshToken };
}

//bump tokenVersion to invalidate all refresh tokens (e.g., logout-all)
export async function bumpTokenVersion(userId) {
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}
