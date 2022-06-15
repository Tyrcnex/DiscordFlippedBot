const addMoney = require(`${process.cwd()}/functions/economy/addMoney.js`)

module.exports = {
    name: 'air',
    itemname: 'Air',
    cooldown: 3600,
    aliases: [],
    price: 16000000,
    sell: 5000000,
    description: 'The air you breathe in. Very cheap indeed... right?',
    multiUse: false,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes) {
        const random = Math.random();

        let randomCoin = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
        if (random < 0.9) {
            await addMoney.execute(user, userData, randomCoin, profileModel);
            return changes.returnMessageContent = `You breathed in fresh air and breathed out some CO2. Your CO2 is so precious, it got you ⏣ ${randomCoin.toLocaleString()}!`
        } else {
            changes.returnedMessageContent = `You breathed too much and choked. The CO2 came out with some mucus, disgusting!`
            return changes.loss = true;
        }
    }
}