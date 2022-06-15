const addItem = require('../../functions/economy/addItem.js')
const removeItem = require('../../functions/economy/removeItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js');
const detectMention = require('../../functions/discord/detectMention.js');
const findItem = require('../../functions/economy/findItem.js')

module.exports = {
    name: "gift",
    aliases: ["giftitem", "itemgift"],
    permissions: [],
    description: "This is the gift command. Here, you can give someone your items!",
    usage: "Type \`{prefix} gift [item] [amount] [user]\`.",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		if (args.length === 0) { message.reply('how do you gift an item that doesn\'t have a name'); return cooldownCheck.cancel() }

        const userMention = await detectMention.execute(message, client, args);
        if (!userMention) { message.reply('either you didn\'t mention anyone or you put an invalid id.'); return cooldownCheck.cancel() }

        const userData = await profileModel.findOne({ userID: userMention.id })
        if (!userData) { message.reply('this user hasn\'t used this bot before, what a loser'); return cooldownCheck.cancel() }

		let inputItem = !parseInt(args.at(-2)) === false ? args.slice(0,-2).join(' ') : args.slice(0, -1).join(' ');
		let amount = !parseInt(args.at(-2)) === false ? parseInt(args.at(-2)) : 1;

        if (amount <= 0){ message.reply('invalid number'); return cooldownCheck.cancel() }
		
        const item = await findItem.execute(inputItem);
		if (!item) { message.reply('that item doesn\'t exist what are you doing lol'); return cooldownCheck.cancel() }

        const invItem = await getItemInventory.execute(profileData, item.name);

        if (!invItem) { message.reply(`You don\'t have this item!`); return cooldownCheck.cancel() }

		await removeItem.execute(message.author, profileData, item.name, amount, profileModel);
        await addItem.execute(userMention, userData, item.name, amount, profileModel);

        var giftEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('Successful business')
        .addFields({name: 'Thank you for your business.', value: `You gave **${amount.toLocaleString()} ${item.itemname}${amount > 1 ? "s" : ""}** to ${userMention.username}`});

        message.reply({ embeds: [giftEmbed] });
    },
};