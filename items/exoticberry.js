const addMoney = require(`${process.cwd()}/functions/economy/addMoney.js`)

module.exports = {
    name: 'exoticberry',
    itemname: 'Exotic Berry',
    aliases: ['exoberry', 'berryexotic', 'exoticbloodberry', 'exotic berry', 'berry exotic', 'exo berry', 'berry'],
    sell: 12000,
    emoji: `<:ExoticBerry:969096909413289994>`,
    description: 'An exotic blood berry is delicious! Replenishes your blood and gets you some coins on consumption.',
    multiUse: false,
    suffix: [1, 'ies'],
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        let randomCoin = Math.floor(Math.random() * (1000 - 100 + 1)) + 1000
        await addMoney.execute(user, userData, randomCoin, profileModel);
        changes.returnMessageContent = `You narfed the exotic blood berry, smearing your mouth with red (and purple) blood. You bend down and see ⏣ ${randomCoin.toLocaleString()} piled at your feet.`;
        return changes.loss = true;
    }
}