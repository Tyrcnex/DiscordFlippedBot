const addMoney = require(`${process.cwd()}/functions/economy/addMoney.js`)

module.exports = {
    name: 'superfriend',
    itemname: 'Super Friend',
    cooldown: 1800,
    aliases: [],
    emoji: `<a:SuperFriend:976367827298693130>`, 
    sell: 100000000,
    description: 'Super Friends™',
    multiUse: false,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        const random = Math.random();

        let randomCoin = Math.floor(Math.random() * (1000000 - 100000 + 1)) + 100000;
        if (random < 0.99) {
            await addMoney.execute(user, userData, randomCoin, profileModel);
            return changes.returnMessageContent = `Your super friend is nice, so they gave you ⏣ ${randomCoin.toLocaleString()}!`;
        } else {
            changes.returnMessageContent = `Your super friend betrayed you. You lost your super friend, oof`;
            return changes.loss = true;
        }
    }
}