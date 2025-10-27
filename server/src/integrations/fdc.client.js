//  tiny HTTP client for FoodData Central
import { config } from '../config/env.js';
//root URL for the food data central API
const BASE = 'https://api.nal.usda.gov/fdc/v1';

 //this function fetches list that contains different variants of a specific food and we filter it later. chicken breast can be raw, cooked, ovened, etc.
export async function fdcSearchFoods(query) {
    const url = `${BASE}/foods/search?api_key=${encodeURIComponent(
        config.FDC_API_KEY
    )}&query=${encodeURIComponent(query)}&pageSize=25&dataType=${config.FDC_ALLOWED_DATATYPES}`;
    //fetch data
    const res = await fetch(url);
    //validation
    if (!res.ok) throw new Error(`FDC search failed: ${res.status}`);
    
    return res.json(); // { foods: [...] }
}

//this function fetches specific food's record after the user picks it for instance raw chicken brest macros
export async function fdcGetFood(fdcId) {
    const url = `${BASE}/food/${fdcId}?api_key=${encodeURIComponent(config.FDC_API_KEY)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FDC get food failed: ${res.status}`);
    return res.json(); // detailed food
}

