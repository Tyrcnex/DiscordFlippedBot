const addMoney = require(`${process.cwd()}/functions/economy/addMoney.js`)

module.exports = {
    name: 'friend',
    itemname: 'Friend',
    cooldown: 3600,
    aliases: [],
    emoji: `<a:Friend:969096849178910811>`, 
    price: 45000000,
    sell: 10000000,
    description: 'Friends... do you have any?',
    enchant: {
        enchantinggem: 50,
        xp: 10000,
        returnedItem: 'superfriend'
    },
    multiUse: false,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        const random = Math.random();

        let randomCoin = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;
        if (random < 0.8) {
            await addMoney.execute(user, userData, randomCoin, profileModel);
            return changes.returnMessageContent = `Your friend is nice, so they gave you ⏣ ${randomCoin.toLocaleString()}!`;
        } else {
            changes.returnMessageContent  = `Your friend betrayed you. You lost your friend, oof`;
            return changes.loss = true;
        }
    }
}