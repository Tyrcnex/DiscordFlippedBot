const addMoney = require('../../functions/economy/addMoney.js')
const removeMoney = require('../../functions/economy/removeMoney.js');
const detectMention = require('../../functions/discord/detectMention.js')

module.exports = {
    name: "share",
    aliases: ["sharemoney"],
    permissions: [],
    description: "This is the share command. Here, you can share someone your coins!",
    usage: "Type \`{prefix} share [amount] [user]\`.",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		if (args.length === 0) { message.reply('lol you need to share some money right?'); return cooldownCheck.cancel() }

        const userMention = await detectMention.execute(message, client, args);
        if (!userMention) { message.reply('either you didn\'t mention anyone or you put an invalid id.'); return cooldownCheck.cancel() }

        if (!parseInt(args.join(' '))) { message.reply('do you know what a number is? it\'s used to describe how much money you have. that\'s not a number.'); return cooldownCheck.cancel() }
        if (isNaN(args[0]) || parseInt(args.join(' ')) <= 0) { message.reply('that\'s not a valid number, can\'t be negative or 0'); return cooldownCheck.cancel() }

        const userData = await profileModel.findOne({ userID: userMention.id })
        if (!userData) { message.reply('this user hasn\'t used this bot before, what a loser'); return cooldownCheck.cancel() }

        const amount = parseInt(args.join(' '));

		await removeMoney.execute(message.author, profileData, amount, profileModel);
        await addMoney.execute(userMention, userData, amount, profileModel);

        var shareEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('Successful share')
        .addFields({name: 'Thank you for your share.', value: `You gave **⏣ ${amount.toLocaleString()}** to ${userMention.username}`});

        message.reply({ embeds: [shareEmbed] });
    },
};