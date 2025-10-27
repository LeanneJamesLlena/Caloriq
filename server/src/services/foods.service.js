import { FoodCache } from '../models/FoodCache.model.js';
import { fdcSearchFoods, fdcGetFood } from '../integrations/fdc.client.js';

// FDC nutrient numbers (stable IDs)
const N = {
    KCAL: 1008,
    PROTEIN: 1003,
    CARBS: 1005,
    FAT: 1004,
    SAT_FAT: 1258,
    FIBER: 1079,
    SUGARS: 2000,
    SODIUM: 1093,
};

// Pull a numeric nutrient by its number; default 0 when missing
function readNutrient(foodNutrients, num) {
    const item = (foodNutrients || []).find((fn) => fn?.nutrient?.number == String(num));
    return Number(item?.amount ?? 0);
}

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

    const cached = await FoodCache.findOne({ fdcId });
    const freshEnough =
        cached && cached.lastFetchedAt && Date.now() - cached.lastFetchedAt.getTime() < CACHE_TTL_MS;

    if (freshEnough) {
        return {
        fdcId: cached.fdcId,
        name: cached.name,
        variant: cached.variant,
        per100g: cached.per100g,
        portions: cached.portions,
        cached: true,
        };
    }

    const detail = await fdcGetFood(fdcId);
    const normalized = normalizeFood(detail);

    await FoodCache.findOneAndUpdate(
        { fdcId },
        { ...normalized, lastFetchedAt: new Date() },
        { upsert: true, new: true }
    );

    return { ...normalized, cached: false };
}
