const getItemInventory = require('./getItemInventory.js');
const findItem = require('./findItem.js');
const removeItem = require('./removeItem.js');
const removeMoney = require('./removeMoney.js');

module.exports = {
	functionName: 'die',
	description: 'Makes a user die',
    /**
     * 
     * @param userData 
     * @param user 
     * @param profileModel 
     * @param {String} msg
     * @param {Boolean} override 
     */
	async execute(Discord, userData, user, profileModel, msg, override) {
        const lifesaver = await getItemInventory.execute(userData, 'lifesaver');
        let remove = false;
        if (!lifesaver || lifesaver.amount <= 0) remove = true;

        let desc = `You died ${msg}!`;

        if (remove) {
            await removeMoney.execute(user, userData, userData.coins, profileModel);
            desc += `\n\n - **You lost ⏣ ${userData.coins.toLocaleString()}**`
            if (userData.items.length) {
                let randomItem = userData.items[Math.floor(Math.random() * userData.items.length)];
                let foundRandomItem = await findItem.execute(randomItem.name);
                let randomAmount = (Math.random() * randomItem.amount | 0) + 1;
                await removeItem.execute(user, userData, randomItem.name, randomAmount, profileModel);
                desc += desc.endsWith('*') ? '\n' : '\n\n';
                desc += ` - **You lost ${randomAmount.toLocaleString()}x ${!!foundRandomItem.emoji ? foundRandomItem.emoji + ' ' : ''}${foundRandomItem.itemname}**`
            }
        } else { 
            await removeItem.execute(user, userData, 'lifesaver', 1, profileModel);
            desc += ` However, you had ${lifesaver.amount.toLocaleString()}x lifesavers at the time of your death, and it saved your life! (You have ${(lifesaver.amount - 1).toLocaleString()}x lifesavers remaining)`
        }

        userData = await profileModel.findOne({ userID: user.id });

        user.send({ embeds: [new Discord.MessageEmbed()
            .setTitle('YOU DIED!')
            .setColor('RED')
            .setDescription(desc)
        ] })
	}
}