const removeItem = require('../../functions/economy/removeItem.js');
const findItem = require('../../functions/economy/findItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js');
const suffixItem = require('../../functions/economy/suffixItem.js');

module.exports = {
    name: "eat",
    aliases: ["eatitem", "itemeat", 'narf', 'chomp'],
    permissions: [],
    description: "This is the eat command. Here, you can eat edible items!",
    usage: "Type \`{prefix} eat [item] [amount (optional)]\`.",
    cooldown: 4,
    cooldownMsg: 'I bet that you\'re already too full... so',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		if (args.length === 0) { message.reply('how do you eat an item that doesn\'t have a name'); return cooldownCheck.cancel() }

		let inputItem = (!parseInt(args.slice(-1)[0]) === false || args.slice(-1)[0] === 'max' || args.slice(-1)[0] === 'all') ? args.slice(0,-1).join(' ') : args.join(' ');
		
        const item = await findItem.execute(inputItem);
		if (!item) { message.reply('that item doesn\'t exist what are you doing lol'); return cooldownCheck.cancel() }

        if (!profileData.items.map(a => a.name).includes(item.name.toLowerCase())) { message.reply(`You don\'t have this item!`); return cooldownCheck.cancel() }
		if (!item.food) { message.reply('You can\'t eat this item 🤔'); return cooldownCheck.cancel() }
        if (profileData.activeItems.map(e => e.name).includes(item.name)) { message.reply(`You\'ve already eaten this item, so you can\'t use it!`); return cooldownCheck.cancel() }

        let amount;
        var itemInv = await getItemInventory.execute(profileData, inputItem);
        if (args.slice(-1)[0] === 'max' || args.slice(-1)[0] === 'all') amount = itemInv.amount;
        else amount = !parseInt(args.slice(-1)[0]) === false ? parseInt(args.slice(-1)[0]) : 1;

        if (amount > itemInv.amount) { message.reply('You don\'t have this many of this item lol'); return cooldownCheck.cancel(); }

        // Cooldowns
        if(!additionalInput.itemCooldowns.has(item.name)){
            additionalInput.itemCooldowns.set(item.name, new Discord.Collection());
        }
    
        const current_time = Date.now();
        const time_stamps = additionalInput.itemCooldowns.get(item.name);
        let cooldown_amount;
        if (item.cooldown) cooldown_amount = item.cooldown * 1000;
    
        if(time_stamps.has(message.author.id)) {
            const expiration_time = time_stamps.get(message.author.id) + cooldown_amount;
    
            if(current_time < expiration_time){
                const cooldownEmbed = new Discord.MessageEmbed()
                .setColor('BLACK')
                .setDescription(`You can eat this item <t:${Math.floor(expiration_time/1000)}:R>`)
                
                return message.reply({embeds: [cooldownEmbed] });
            }
        }

        class Changes {
            constructor (loss, returnMessageObj, returnMessageContent, lossItemMsg, activeChanges, stopCooldown) {
                this.loss = loss;
                this.returnMessageObj = returnMessageObj;
                this.returnMessageContent = returnMessageContent;
                this.lossItemMsg = lossItemMsg;
                this.activeChanges = activeChanges;
                this.stopCooldown = stopCooldown;
            }
        }

        let changes = new Changes(false, undefined, undefined, true, [], false);
        
        await item.use(client, message, cmd, args, Discord, message.author, profileModel, profileData, amount, cooldownCheck, additionalInput, changes);
        if (changes.loss === true) {
            if (changes.lossItemMsg === true) {
                var theItemName = itemInv.amount - (item.multiUse === true ? amount : 1) === 1 ? item.itemname : ( !!item.suffix ? suffixItem.execute(item.itemname, item.suffix[1], item.suffix[0]) : suffixItem.execute(item.itemname));
                const string = `\n\nYou have **${itemInv.amount - (item.multiUse === true ? amount : 1)}x ${theItemName}** remaining.`
                if (changes.returnMessageContent) changes.returnMessageContent += string
                else if (changes.returnedMessageObj) changes.returnedMessageObj.content += string;
            }
            await removeItem.execute(message.author, profileData, item.name, (item.multiUse === true ? amount : 1), profileModel);
        }
        if (!isNaN(item.active) && changes.activeChanges.length) {
            let obj = { name: item.name, changes: [], deactivate: Date.now() + item.active };
            for (var change of changes.activeChanges) { obj.changes.push(change) }
            await profileModel.findOneAndUpdate({ userID: message.author.id }, { $push: { activeItems: obj } })
        }
        if (changes.returnMessageContent) message.reply(changes.returnMessageContent);
        else if (changes.returnMessageObj) message.reply(changes.returneessageObj);

        time_stamps.set(message.author.id, current_time);
        setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount);
    },
};