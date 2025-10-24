//define the logic of: create user, verify login, sign tokens.
import bcrypt from 'bcrypt';
import { User } from '../models/User.model.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
//when this function is called pass in an object for instance {email: "..", password: "..."}
//using object destructuring we save the values straight to variables, where variable=key of the value
export async function createUser({ email, password }) {
    //try to find user with the given email from the database
    const existing = await User.findOne({
        email: email
    })
    if (existing) {
        throw new Error('Email is already registered');
    }
    //if the email isnt used then hash the given password
    const passwordHash = await bcrypt.hash(password, 10);
    //create new user
    const newUser = await User.create({
        email: email,
        passwordHash: passwordHash,
    });
    return newUser;
}

export async function verifyUser(email, password) {
    const user = await User.findOne({
        email: email,
    })
    if (!user) {
        throw new Error('Invalid credentials');
    };
    // using bcrypt inbuilt function .compare allows us to compare a string value password to hash value password
    const passwordMatched = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatched) {
        throw new Error('Invalid credentials');
    }
    return user;
}

export async function signTokens(user) {
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
