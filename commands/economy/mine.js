const getItems = require('../../functions/economy/getItems.js');
const addItem = require('../../functions/economy/addItem.js');
const findItem  = require('../../functions/economy/findItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js');

module.exports = {
    name: "mine",
    aliases: [],
    permissions: [],
    description: "Mine for ores, which can be used for crafting.",
    usage: "Type in \`{prefix} mine\`",
    cooldown: 20,
    isGrind: true,
    xpAdd: 1,
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        const cumulativeSumF = (sum => value => sum += value);
        var oreList = (await getItems.execute()).filter(e => e.name.toLowerCase().startsWith('ore'));
		
        var oreData = require('../../jsData/mineData.js');

        let hasPickaxe = await getItemInventory.execute(profileData, 'pickaxe');
        let hasEnchanted = await getItemInventory.execute(profileData, 'enchanted_pickaxe')

        if (!hasPickaxe && !hasEnchanted) { message.reply('You don\'t have a pickaxe, buy one in the store.'); return cooldownCheck.cancel() }

        let oreChances = oreData.map(e => e.chance);
        if (hasEnchanted) {
            let diff = 1 / oreChances.reduce((a,b) => a+b,0);
            oreChances = oreChances.map(e => e * diff);
        }

        var cumulativeOreData = oreChances.map(cumulativeSumF(0));
        cumulativeOreData.unshift(0);
        var random = Math.random(); var item;
        for (var i = 0; i < cumulativeOreData.length - 1; i++) {
            if(random > cumulativeOreData[i] && random < cumulativeOreData[i + 1]) { 
                let ithItem = oreData[i].ores[Math.floor(Math.random() * oreData[i].ores.length)];
                item = ithItem.nonOre ? await findItem.execute(ithItem.name) : oreList.find(e => e.name === ('ore_' + ithItem.name)); break; 
            } else continue;
        }
        
        var messageObj = {};
        if (!item) messageObj.content = 'You mined for the entire day and night, and you still couldn\'t find anything, what a noob';
        else { 
            messageObj.content = `You mined and found a **${!!item.emoji ? item.emoji + ' ' : ''}${item.itemname}!**`;
            await addItem.execute(message.author, profileData, item.name, 1, profileModel);
        }

        message.reply(messageObj);
    },
  };