import { FoodCache } from '../models/FoodCache.model.js';
import { fdcSearchFoods, fdcGetFood } from '../integrations/fdc.client.js';

const ALLOWED_DATATYPES = ['Foundation', 'SR Legacy'];
// FDC nutrient numbers (stable IDs)
const N = {
    KCAL:   ['1008', '208'],
    PROTEIN:['1003', '203'],
    CARBS:  ['1005', '205'],
    FAT:    ['1004', '204'],
    SAT_FAT:['1258', '606'],
    FIBER:  ['1079', '291'],
    SUGARS: ['2000', '269'],
    SODIUM: ['1093', '307'],
};

function isZeroBlock(per100g = {}) {
    return Object.values(per100g).every(v => !Number(v));
}

// Replace your readNutrient with this:
function readNutrient(foodNutrients = [], nums) {
    const targets = Array.isArray(nums) ? nums.map(String) : [String(nums)];

    const item = foodNutrients.find((fn) => {
        const num =
        fn?.nutrient?.number ??
        fn?.nutrientNumber ??
        fn?.nutrient?.id ??
        fn?.nutrientId;
        return num && targets.includes(String(num));
    });

    if (!item) return 0;

    // Amount field can be 'amount' or 'value'
    let amount = item.amount ?? item.value ?? 0;

    // Handle energy possibly reported in kJ
    const unit = item?.nutrient?.unitName ?? item?.unitName;
    const isEnergy = targets.includes('1008') || targets.includes('208');
    if (isEnergy && unit && unit.toLowerCase() === 'kj') {
        amount = amount / 4.184; // kJ → kcal
    }

    return Number(amount) || 0;
};

// Attempt to detect a “variant” label from description (raw/cooked)
function detectVariant(desc = '') {
    const d = desc.toLowerCase();
    if (d.includes('raw')) return 'raw';
    if (d.includes('cooked')) return 'cooked';
    return null;
}

// Build normalized per-100g + portions from an FDC detail
function normalizeFood(detail) {
    // For SR Legacy / Foundation, nutrients are per 100g
    const per100g = {
        kcal: readNutrient(detail.foodNutrients, N.KCAL),
        protein: readNutrient(detail.foodNutrients, N.PROTEIN),
        carbs: readNutrient(detail.foodNutrients, N.CARBS),
        sugars: readNutrient(detail.foodNutrients, N.SUGARS),
        fiber: readNutrient(detail.foodNutrients, N.FIBER),
        fat: readNutrient(detail.foodNutrients, N.FAT),
        satFat: readNutrient(detail.foodNutrients, N.SAT_FAT),
        sodium: readNutrient(detail.foodNutrients, N.SODIUM),
    };

    // Portions (fall back to 100 g)
    const portions = [{ name: '100 g', gram: 100 }];

    (detail.foodPortions || []).forEach((p) => {
        const gram = Number(p?.gramWeight);
        if (!Number.isFinite(gram) || gram <= 0) return;

        const name =
        p?.portionDescription ||
        p?.modifier ||
        p?.measureUnit?.name ||
        'portion';

        // de-dupe simple cases
        if (!portions.some((x) => x.name === name && x.gram === gram)) {
        portions.push({ name, gram });
        }
    });
    const name = detail.description?.trim() || 'Food';
    const variant = detectVariant(name);

    return {
        fdcId: detail.fdcId,
        name,
        variant,
        per100g,
        portions,
    };
}

// Search generics (Foundation/SR Legacy) and return lightweight list
export async function searchFoodsService(q) {
    if (!q || String(q).trim().length < 2) return [];
    const json = await fdcSearchFoods(q.trim());
    const foods = (json.foods || [])
        .filter((f) => ['Foundation', 'SR Legacy'].includes(f.dataType))
        .map((f) => ({
        fdcId: f.fdcId,
        name: f.description,
        variant: detectVariant(f.description),
        dataType: f.dataType,
        }))
        .slice(0, 25);

    return foods;
}

// Get a normalized food; use cache with ~30-day TTL
export async function getFoodByIdService(fdcId) {
    const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

    // 1) Try cache first
    const cached = await FoodCache.findOne({ fdcId }).lean();
    const freshEnough = cached && cached.lastFetchedAt &&
        (Date.now() - cached.lastFetchedAt.getTime() < CACHE_TTL_MS);

    if (freshEnough && !isZeroBlock(cached.per100g)) {
        return {
        fdcId: cached.fdcId,
        name: cached.name,
        variant: cached.variant,
        per100g: cached.per100g,
        portions: cached.portions,
        cached: true,
        };
    }

    // If we had a bad/zero cache, drop it before refetch
    if (cached && isZeroBlock(cached.per100g)) {
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
