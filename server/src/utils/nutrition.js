
//scales per 100g food profile to actual weight
//for exampl if the user logs that the certain food weighgts 340 g then calculate total macros
// 100 g will be its foundation
export function scalePer100g(per100g, grams) {
    const m = (Number(grams) || 0) / 100;
    const g1 = (x) => Number((x * m).toFixed(1));
    const g2 = (x) => Number((x * m).toFixed(2));
    return {
        kcal: Math.round((per100g.kcal || 0) * m),
        protein: g1(per100g.protein || 0),
        carbs:   g1(per100g.carbs || 0),
        sugars:  g2(per100g.sugars || 0),
        fiber:   g1(per100g.fiber || 0),
        fat:     g1(per100g.fat || 0),
        satFat:  g2(per100g.satFat || 0),
        sodium:  Math.round((per100g.sodium || 0) * m),
    };
}

//adds two nutrient objects together for exampl: breakfast macros + lunch macros
export function addN(a, b) {
    return {
        kcal: (a.kcal || 0) + (b.kcal || 0),
        protein: (a.protein || 0) + (b.protein || 0),
        carbs:   (a.carbs || 0) + (b.carbs || 0),
        sugars:  (a.sugars || 0) + (b.sugars || 0),
        fiber:   (a.fiber || 0) + (b.fiber || 0),
        fat:     (a.fat || 0) + (b.fat || 0),
        satFat:  (a.satFat || 0) + (b.satFat || 0),
        sodium:  (a.sodium || 0) + (b.sodium || 0),
    };
}
