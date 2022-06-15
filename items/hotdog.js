const addMoney = require(`${process.cwd()}/functions/economy/addMoney.js`)

module.exports = {
    name: 'hotdog',
    itemname: 'Hot Dog',
    aliases: ['hot dog'],
    emoji: `<:Hotdog:969096910503837807>`,
    cooldown: 100,
    sell: 1000,
    description: 'This dawg is so hot, you should eat it!',
    multiUse: true,
    food: true,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        let randomCoin = Array.from({length: amount}, () => Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000).reduce((a, b) => a + b, 0);
        changes.returnMessageContent = `You ate ${amount.toLocaleString()} hot dog${amount === 1 ? '' : 's'} and the dawg${amount === 1 ? '' : 's'} (what?) gave you ⏣ ${randomCoin.toLocaleString()}.`;
        return changes.loss = true;
    }
}