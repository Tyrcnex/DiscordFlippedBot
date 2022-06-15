const getItemInventory = require(`${process.cwd()}/functions/economy/getItemInventory.js`)

module.exports = {
    name: 'banknote',
    itemname: 'Banknote',
    aliases: ['bank', 'bnknote', 'kno', 'knos', 'banknotes'],
    emoji: `<a:Banknote:969096909493002280>`,
    price: 210000,
    sell: 40000,
    description: 'Increases bankspace by a random value from ⏣ 10,000-100,000',
    multiUse: true,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        const item = await getItemInventory.execute(userData, 'banknote');
        const itemAmount = item.amount;

        let randomCoin = Array.from({length: amount}, () => Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000).reduce((a, b) => a + b, 0);
        await profileModel.findOneAndUpdate({
            userID: user.id,
        }, {
            $inc: {
                bankspace: randomCoin
            }
        })
        let bankEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle(`Used banknote${itemAmount === 1 ? "" : 's'}`)
        .addFields(
            { name: `Used:`, value: `${amount.toLocaleString()}x (${(itemAmount - amount).toLocaleString()}x left)`, inline: true },
            { name: `Bank space earned:`, value: `⏣ ${randomCoin.toLocaleString()}`, inline: true },
            { name: `New bank space:`, value: `⏣ ${(userData.bankspace + randomCoin).toLocaleString()}`, inline: true }
        );

        changes.returnMessageObj = { embeds: [bankEmbed] };
        changes.lossItemMsg = false;
        return changes.loss = true;
    }
}