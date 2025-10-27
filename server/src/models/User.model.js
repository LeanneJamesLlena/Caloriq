import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
        },

        timezone: {
            type: String,
            default: 'Europe/Helsinki',
        },

        targets: {
            _id: false,
            calories: { type: Number, default: null },
            protein: { type: Number, default: null },
            carbs: { type: Number, default: null },
            fat: { type: Number, default: null },
            fiber: { type: Number, default: null },
        },

        tokenVersion: {
            type: Number,
            default: 0,
        },

    },

    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }

);


export const User = mongoose.model("User", userSchema);