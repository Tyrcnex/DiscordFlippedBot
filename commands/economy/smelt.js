const removeItem = require('../../functions/economy/removeItem.js');
const addItem = require('../../functions/economy/addItem.js');
const findItem = require('../../functions/economy/findItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js');
const suffixItem = require('../../functions/economy/suffixItem.js')

module.exports = {
    name: "smelt",
    aliases: ["furnace"],
    permissions: [],
    description: "Here, you can smelt ores into bars and other valuable gems and metals!",
    usage: "Type \`{prefix} smelt [item] [amount (optional)]\`.",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		if (args.length === 0) { message.reply('you have to smelt an actual item, lol'); return cooldownCheck.cancel() }

		let inputItem = (!parseInt(args.slice(-1)[0]) === false || args.slice(-1)[0] === 'max' || args.slice(-1)[0] === 'all') ? args.slice(0,-1).join(' ') : args.join(' ');
		
        const item = await findItem.execute(inputItem);
		if (!item) { message.reply('that item doesn\'t exist what are you doing lol'); return cooldownCheck.cancel() }

        if (!(await getItemInventory.execute(profileData, item.name))) { message.reply(`You don\'t have this item!`); return cooldownCheck.cancel() }
		if (!item.smelt) { message.reply('That\'s not a smeltable item 🤔'); return cooldownCheck.cancel() }

        let amount;
        var itemInv = await getItemInventory.execute(profileData, item.name);
        var smeltedItem = await findItem.execute(item.smelt);
        var coal = await getItemInventory.execute(profileData, 'coal');
        var coalFind = await findItem.execute('coal')
        if (!coal) { message.reply('You don\'t have any coal to smelt with, go get some from the mine command'); return cooldownCheck.cancel() }
        if (args.slice(-1)[0] === 'max' || args.slice(-1)[0] === 'all') amount = Math.min(itemInv.amount, coal.amount);
        else amount = !parseInt(args.slice(-1)[0]) === false ? parseInt(args.slice(-1)[0]) : 1;

        if (amount <= 0) { message.reply('Invalid number'); return cooldownCheck.cancel() }

        if (amount > itemInv.amount) { message.reply('You don\'t have this many of this item lol'); return cooldownCheck.cancel(); }
        else if (amount > coal.amount) { message.reply('You don\'t have enough coal to smelt these ores!'); return cooldownCheck.cancel() }
		
        await removeItem.execute(message.author, profileData, item.name, amount, profileModel);
        await removeItem.execute(message.author, profileData, 'coal', amount, profileModel);
        await addItem.execute(message.author, profileData, item.smelt, amount, profileModel);

        const smeltEmbed = new Discord.MessageEmbed()
        .setColor('ORANGE')
        .setTitle('🔥 SMELTING 🔥')
        .addFields(
            { name: 'Smelted Ore:', value: `${amount.toLocaleString()}x ${!!item.emoji ? item.emoji + ' ' : ''} ${item.itemname}`, inline: true },
            { name: 'Smelted Item:', value: `${amount.toLocaleString()}x ${!!smeltedItem.emoji ? smeltedItem.emoji + ' ' : ''} ${smeltedItem.itemname}`, inline: true },
            { name: 'Used:', value: `${amount.toLocaleString()}x ${!!coalFind.emoji ? coalFind.emoji + ' ' : ''} Coal`, inline: true }
        )
        message.reply({ embeds: [smeltEmbed] });
    },
};