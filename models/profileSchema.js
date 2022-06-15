const mongoose = require("mongoose");

const schemaObj = {
    // User data
    userID: { type: String, require: true, unique: true },
    username: { type: String, default: "Username" },

    // Coins and bank
    coins: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    bankspace: { type: Number, default: 50000 },

    // Items
    items: { type: Array, default: [] },

    // XP
    xp: { type: Number, default: 0 }, 
    lastXP: { type: Number, default: 0 },

    // Multi, Active Items and Debuffs
    multi: { type: Number, default: 0 },
    multiObj: { type: Array, default: [] },
    activeItems: { type: Array, default: [] },
    debuffs: { type: Array, default: [] },

    // Daily
    lastDaily: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },

    // Monthly
    lastMonthly: { type: Array, default: [1, 1970] },

    // Adventure
    adventure: { type: Array, default: [-1, false, undefined] },
    adventureBackpack: { type: Array, default: [] },
    adventureLoot: { type: Object, default: { coin: 0, items: [] } },
    adventureStageOrder: { type: Array, default: [] },
    lastAdventure: { type: Number, default: 0 },

    // Work
    lastWork: { type: Number, default: 0 },
    job: { type: String, default: '' },
    timesWorkedToday: { type: Number, default: 0 },
    workFailsToday: { type: Number, default: 0 },
    resign: { type: Number, default: 0 },
    lostJob: { type: Number, default: 0 }
};

let defaultObj = {};
Object.assign(defaultObj, schemaObj);

for (const property of Object.keys(defaultObj)) {
    defaultObj[property] = schemaObj[property].default;
}

const profileSchema = new mongoose.Schema(schemaObj);

const profileModel = mongoose.model("ProfileModels", profileSchema);

class UserSchema {
    getSchema() {
        return {
            schemaObj: schemaObj,
            defaultObj: defaultObj,
            profileModel: profileModel,
        };
    }
}

module.exports = UserSchema;