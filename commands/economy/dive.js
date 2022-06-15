const addItem = require('../../functions/economy/addItem.js');
const findItem  = require('../../functions/economy/findItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js');

module.exports = {
    name: "dive",
    aliases: [],
    permissions: [],
    description: "Dive for items.",
    usage: "Type in \`{prefix} dive\`",
    cooldown: 20,
    isGrind: true,
    xpAdd: 1,
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        const cumulativeSumF = (sum => value => sum += value);
		
        var itemData = require('../../jsData/diveData.js');

        let hasSnorkel = await getItemInventory.execute(profileData, 'snorkel');
        let hasScubaGear = await getItemInventory.execute(profileData, 'scuba_gear')

        if (!hasSnorkel && !hasScubaGear) { message.reply('You don\'t have scuba gear or a snorkel, buy one in the store.'); return cooldownCheck.cancel() }

        let itemChances = itemData.map(e => e.chance);
        if (hasScubaGear) {
            let diff = 1 / itemChances.reduce((a,b) => a+b,0)
            itemChances = itemChances.map(e => e * diff);
        }

        var cumulativeitemData = itemChances.map(cumulativeSumF(0));
        cumulativeitemData.unshift(0);
        var random = Math.random(); var item;
        for (var i = 0; i < cumulativeitemData.length - 1; i++) {
            if(random > cumulativeitemData[i] && random < cumulativeitemData[i + 1]) { 
                let ithItem = itemData[i].items[Math.floor(Math.random() * itemData[i].items.length)];
                item = await findItem.execute(ithItem.name); break;
            } else continue;
        }
        
        var messageObj = {};
        if (!item) messageObj.content = 'You went diving for an entire day and couldn\'t find anything, rip';
        else { 
            messageObj.content = `You went diving and found a **${!!item.emoji ? item.emoji + ' ' : ''}${item.itemname}!**`;
            await addItem.execute(message.author, profileData, item.name, 1, profileModel);
        }

        message.reply(messageObj);
    },
  };