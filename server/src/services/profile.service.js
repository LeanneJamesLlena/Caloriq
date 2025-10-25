// define the logic of getting User's target(Macros), Update Target(Macros),
import { User } from '../models/User.model.js';

// Read current Targets (Macros) for a user
export async function getTargets(userId) {
    //get the the user and save it inside user. We are filtering using "select" the values we are getting. So we only want the values of the properties targets(macros->calories, protein, fiber.etc), timezone and email. Without this user object will have all the properties such as token, passwordHash, etc and we dont need those.
    const user = await User.findById(userId).select('targets timezone email');
    if (!user) throw new Error('User not found');
    return { targets: user.targets, timezone: user.timezone, email: user.email };
}

// Update targets (calories, protein, carbs, fat, fiber)
export async function updateTargets(userId, updates) {
    //Our function is expecting userId and updates -> which is an object that contains user macros as properties, example updates -> {calories: "1700", fiber: "10"}, etc.
    //clean will be the object that contains macros as properties and their new updated values
    const clean = {};
    //keys -> helper array of strings that contains all macros as element
    const keys = ['calories', 'protein', 'carbs', 'fat', 'fiber'];
    // loop the macros starting with 'calories'
    for (const k of keys) {

        // check if macro currently looping exist in updates object
        if (k in updates) {
            // get the value of the macro from object updates and save in v
            const v = updates[k];
            //validate value of v
            if (v == null || v === '') {
                clean[`targets.${k}`] = null;
            } else {
                // parse the datatype of the value into number
                const n = Number(v);
                if (!Number.isFinite(n) || n < 0) {
                throw new Error(`Invalid value for ${k}`);
                }
                //save the valid and updated value and macro(key) in the object clean
                clean[`targets.${k}`] = n; 
            }
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: clean },
        { new: true, runValidators: true, select: 'targets timezone email' } 
    ); 

    if (!user) throw new Error('User not found');
    return { targets: user.targets, timezone: user.timezone, email: user.email };

}