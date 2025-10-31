//Food controller's helper functions
import { FoodCache } from '../models/FoodCache.model.js';
import { fdcSearchFoods, fdcGetFood } from '../integrations/fdc.client.js';
import { config } from '../config/env.js';

// Single source of truth for allowed datasets (falls back sensibly)
const ALLOWED_DATATYPES = (config.FDC_ALLOWED_DATATYPES || 'Foundation,SR Legacy')
.split(',')
.map(s => s.trim())
.filter(Boolean);

// FDC nutrient numbers (new + legacy)
const N = {
    KCAL:    ['1008', '208'],
    PROTEIN: ['1003', '203'],
    CARBS:   ['1005', '205'],
    FAT:     ['1004', '204'],
    SAT_FAT: ['1258', '606'],
    FIBER:   ['1079', '291'],
    SUGARS:  ['2000', '269'],
    SODIUM:  ['1093', '307'],
};

const SUGARS_INDIVIDUAL = {
    SUCROSE:  '1010',
    GLUCOSE:  '1011', 
    FRUCTOSE: '1012',
    LACTOSE:  '1013',
    MALTOSE:  '1014',
    GALACTOSE:'1015',
};

// ---- helpers ----

function clampNonNegNumber(x) {
    const n = Number(x);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function hasNutrientNumber(foodNutrients = [], nums) {
    const targets = Array.isArray(nums) ? nums.map(String) : [String(nums)];
    return foodNutrients.some(fn => {
        const num = fn?.nutrient?.number ?? fn?.nutrientNumber;
        return num && targets.includes(String(num));
    });
}


// read sugars with robust fallback
function readSugars(foodNutrients = []) {
    const totalPresent = hasNutrientNumber(foodNutrients, N.SUGARS);
    const total = readNutrient(foodNutrients, N.SUGARS);

    // If "Sugars, total" exists in the record, always respect it (even if 0)
    if (totalPresent) return total;

    // Otherwise, fallback: sum individual sugars (any that are present)
    const parts = Object.values(SUGARS_INDIVIDUAL).map(id => readNutrient(foodNutrients, id));
    const sum = parts.reduce((a, b) => a + (Number(b) || 0), 0);
    return Number.isFinite(sum) ? sum : 0;
}


/**
 * Consider "zero block" only when kcal==0 AND all macros==0.
 * This prevents sodium-or-sugars alone from keeping an invalid entry.
 */
function isZeroBlock(per100g = {}) {
    const kcal = Number(per100g.kcal) || 0;
    const p = Number(per100g.protein) || 0;
    const c = Number(per100g.carbs) || 0;
    const f = Number(per100g.fat) || 0;
    return kcal === 0 && p === 0 && c === 0 && f === 0;
}

function calcKcalFromMacros({ protein = 0, carbs = 0, fat = 0 }) {
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fat) || 0;
    return Math.round(4 * p + 4 * c + 9 * f);
}

/**
 * Read a nutrient regardless of FDC shape (Foundation/SR Legacy).
 * - Supports nested nutrient.number/amount and flat nutrientNumber/value
 * - For energy, prefers kcal; falls back to kJ→kcal.
 * - Deduplicates by choosing the first finite value after preference.
 */
function readNutrient(foodNutrients = [], nums) {
    const targets = Array.isArray(nums) ? nums.map(String) : [String(nums)];

    // Match ONLY by nutrient.number / nutrientNumber (do NOT use nutrient.id)
    const matches = foodNutrients.filter(fn => {
        const num = fn?.nutrient?.number ?? fn?.nutrientNumber;
        return num && targets.includes(String(num));
    });

    if (!matches.length) return 0;

    const normalized = matches.map(item => {
        const unit = (item?.nutrient?.unitName ?? item?.unitName ?? '').toLowerCase();
        const amount = Number(item?.amount ?? item?.value ?? 0) || 0;
        return { amount, unit };
    });

    const isEnergy = targets.includes('1008') || targets.includes('208');
    if (isEnergy) {
        const kcalItem = normalized.find(n => n.unit === 'kcal' && Number.isFinite(n.amount) && n.amount !== 0);
        if (kcalItem) return kcalItem.amount;
        const kJItem = normalized.find(n => n.unit === 'kj' && Number.isFinite(n.amount) && n.amount !== 0);
        if (kJItem) return kJItem.amount / 4.184;

        const anyKcal = normalized.find(n => n.unit === 'kcal' && Number.isFinite(n.amount));
        if (anyKcal) return anyKcal.amount;
        const anyKJ = normalized.find(n => n.unit === 'kj' && Number.isFinite(n.amount));
        if (anyKJ) return anyKJ.amount / 4.184;
        return 0;
    }

    // Non-energy: prefer first non-zero; else first finite (possibly zero)
    const nonZero = normalized.find(n => Number.isFinite(n.amount) && n.amount > 0);
    if (nonZero) return nonZero.amount;

    const zeroOk = normalized.find(n => Number.isFinite(n.amount));
    return zeroOk ? zeroOk.amount : 0;
}


/*
simplified the variant to either cook or raw
 */
function detectVariant(desc = '') {
    const d = String(desc).toLocaleLowerCase('en-US');
    const tokens = d
        .replace(/[()_,/.-]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    const has = (word) => tokens.includes(word);

    // Handle explicit negation forms first
    if (has('uncooked')) return 'raw';
    if (has('not') && has('cooked')) return 'raw';

    const COOKED = [
        'cooked','roasted','grilled','broiled','baked','boiled','simmered','stewed',
        'braised','poached','steamed','sauteed','sautéed','fried','pan-fried','deep-fried',
        'air-fried','microwaved','smoked','barbecued','bbq','rotisserie','toasted',
        'pressure','slow-cooked'
    ];
    if (COOKED.some(w => has(w))) return 'cooked';

    const RAW = ['raw','fresh','unheated','sashimi-grade'];
    if (RAW.some(w => has(w))) return 'raw';

    return null;
}

/**
 * Clamp negatives to 0 and round:
 * - kcal: integer
 * - grams: 2 decimals
 * - sodium (mg): integer (FDC uses mg)
 */
function sanitizePer100g(p) {
    const safe = {
        kcal:   clampNonNegNumber(p.kcal),
        protein: clampNonNegNumber(p.protein),
        carbs:   clampNonNegNumber(p.carbs),
        sugars:  clampNonNegNumber(p.sugars),
        fiber:   clampNonNegNumber(p.fiber),
        fat:     clampNonNegNumber(p.fat),
        satFat:  clampNonNegNumber(p.satFat),
        sodium:  clampNonNegNumber(p.sodium),
    };

    safe.kcal    = Math.round(safe.kcal);
    safe.protein = Number(safe.protein.toFixed(2));
    safe.carbs   = Number(safe.carbs.toFixed(2));
    safe.sugars  = Number(safe.sugars.toFixed(2));
    safe.fiber   = Number(safe.fiber.toFixed(2));
    safe.fat     = Number(safe.fat.toFixed(2));
    safe.satFat  = Number(safe.satFat.toFixed(2));
    safe.sodium  = Math.round(safe.sodium);

    return safe;
}

/**
 * Build normalized per-100g + portions from an FDC detail
 */
function normalizeFood(detail) {
    // Nutrients are per 100 g for Foundation/SR Legacy
    let per100g = {
        kcal:    readNutrient(detail.foodNutrients, N.KCAL),
        protein: readNutrient(detail.foodNutrients, N.PROTEIN),
        carbs:   readNutrient(detail.foodNutrients, N.CARBS),
        sugars:  readSugars(detail.foodNutrients),
        fiber:   readNutrient(detail.foodNutrients, N.FIBER),
        fat:     readNutrient(detail.foodNutrients, N.FAT),
        satFat:  readNutrient(detail.foodNutrients, N.SAT_FAT),
        sodium:  readNutrient(detail.foodNutrients, N.SODIUM),
    };

    // Fallback: compute kcal if missing/zero but macros exist
    if ((!Number(per100g.kcal) || per100g.kcal === 0) &&
        (per100g.protein || per100g.carbs || per100g.fat)) {
        per100g.kcal = calcKcalFromMacros(per100g);
    }

    per100g = sanitizePer100g(per100g);

    // Portions (always include 100 g)
    const portions = [{ name: '100 g', gram: 100 }];
    for (const p of (detail.foodPortions || [])) {
        const gram = Number(p?.gramWeight);
        if (!Number.isFinite(gram) || gram <= 0) continue;

        const rawName = p?.portionDescription || p?.modifier || p?.measureUnit?.name || 'portion';
        const name = String(rawName).replace(/\s+/g, ' ').trim();

        // Case-insensitive dedupe on (name, gram)
        if (!portions.some(x => x.gram === gram && x.name.toLowerCase() === name.toLowerCase())) {
        portions.push({ name, gram });
        }
    }

    const name = (detail.description || '').trim() || 'Food';
    const variant = detectVariant(name);

    return {
        fdcId: detail.fdcId,
        name,
        variant,
        per100g,
        portions,
        dataType: detail.dataType, // remember dataset
    };
}

// ---- services ----

/**
 * Search generics and return a clean, ranked list (Foundation first),
 * deterministic within group (name, then fdcId).
 */
export async function searchFoodsService(q) {
    if (!q || String(q).trim().length < 2) return [];
    const json = await fdcSearchFoods(String(q).trim());

    const items = (json.foods || [])
        .filter(f => ALLOWED_DATATYPES.includes(f.dataType))
        .map(f => ({
        fdcId: f.fdcId,
        name: f.description || '',
        variant: detectVariant(f.description || ''),
        dataType: f.dataType,
        }));

    items.sort((a, b) => {
        if (a.dataType !== b.dataType) {
        return a.dataType === 'Foundation' ? -1 : 1;
        }
        const an = a.name.toLowerCase();
        const bn = b.name.toLowerCase();
        if (an !== bn) return an.localeCompare(bn);
        return (a.fdcId || 0) - (b.fdcId || 0);
    });

    return items.slice(0, 25);
}

/**
 * Get a normalized food; use cache with ~30-day TTL.
 * - Only serves generic datasets.
 * - Self-heals: deletes cached non-generic or zero-block.
 */
export async function getFoodByIdService(fdcId) {
    const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

    // 1) Try cache first
    const cached = await FoodCache.findOne({ fdcId }).lean();
    const freshEnough =
        cached?.lastFetchedAt &&
        (Date.now() - new Date(cached.lastFetchedAt).getTime() < CACHE_TTL_MS);

    if (
        freshEnough &&
        cached?.dataType &&
        ALLOWED_DATATYPES.includes(cached.dataType) &&
        !isZeroBlock(cached.per100g)
    ) {
        return {
        fdcId: cached.fdcId,
        name: cached.name,
        variant: cached.variant,
        per100g: cached.per100g,
        portions: cached.portions,
        cached: true,
        };
    }

    // If cached but invalid (non-generic or zero block), drop it before refetch
    if (cached && (!ALLOWED_DATATYPES.includes(cached.dataType || '') || isZeroBlock(cached.per100g))) {
        await FoodCache.deleteOne({ fdcId });
    }

    // 2) Fetch live detail from FDC
    const detail = await fdcGetFood(fdcId);

    // Guard: allow generic datasets only
    if (!ALLOWED_DATATYPES.includes(detail.dataType)) {
        const err = new Error(`Only generic foods are supported (got ${detail.dataType})`);
        err.status = 422;
        throw err;
    }

    // 3) Normalize → must produce non-zero per100g for generics
    const normalized = normalizeFood(detail);
    if (isZeroBlock(normalized.per100g)) {
        const err = new Error('Nutrient data unavailable for this record');
        err.status = 422;
        throw err;
    }

    // 4) Upsert into cache and return
    await FoodCache.findOneAndUpdate(
        { fdcId },
        { ...normalized, lastFetchedAt: new Date() },
        { upsert: true, new: true }
    );

    return { ...normalized, cached: false };
}