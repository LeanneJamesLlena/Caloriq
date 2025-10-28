import mongoose from 'mongoose';

const portionsSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        gram: { type: Number, required: true },

    },

    { 
        _id: false 
    }

);

const per100gSchema = new mongoose.Schema(
    {
        kcal: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        sugars: { type: Number, required: true },
        fiber: { type: Number, required: true },
        fat: { type: Number, required: true },
        satFat: { type: Number, required: true },
        sodium: { type: Number, required: true },
    },
    
    { 
        _id: false 
    }
);
//main schema will that will be saved in database
const foodCacheSchema = new mongoose.Schema(
    {
        fdcId: { type: Number, unique: true, index: true },
        name: { type: String, required: true },
        variant: { type: String, default: null }, // e.g., raw/cooked
        //remember dataset to enforce generic-only on reads
        dataType:{ type: String, enum: ['Foundation', 'SR Legacy'], required: true },
        per100g: { type: per100gSchema, required: true },
        portions: { type: [portionsSchema], default: [] },
        lastFetchedAt: { type: Date, default: () => new Date() },
    },

    {
        timestamps: true 
    }
);

export const FoodCache = mongoose.model('FoodCache', foodCacheSchema);

