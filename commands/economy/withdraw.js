module.exports = {
    name: "withdraw",
	cooldown: 3,
    aliases: ['with'],
    permissions: [],
    description: "Withdraw money into your wallet.",
    usage: "Type in \`{prefix} withdraw [amount]\`",
	cooldownMsg: 'You\'ve withdrawed some money recently',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        if (!args.length) {
			message.reply('Heya, what\'s the point of not withdrawing anything?');
			return cooldownCheck.cancel();
		};

        var withAmount;
        if (args[0] == 'all' || args[0] == 'max') withAmount = profileData.bank;
        else withAmount = parseInt(args[0]);

        if (isNaN(withAmount)) { message.reply(`You\'ll have to withdraw an actual number, lol`); return cooldownCheck.cancel(); }
        if (withAmount < 0) { message.reply(`You can\'t withdraw a negative number, do you have any common sense?`); return cooldownCheck.cancel(); }

        if (profileData.bank < withAmount) { message.reply(`You don\'t have enough coins in your bank!`); return cooldownCheck.cancel(); }

        await profileModel.findOneAndUpdate(
            { userID: message.author.id }, 
            { $inc: {
                coins: withAmount,
                bank: -withAmount,
            } }
        );

        profileData = await profileModel.findOne( { userID: message.author.id } );

        const withEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .addFields(
            { name: 'Withdraw Amount', value: `⏣ ${withAmount.toLocaleString()}` },
            { name: 'New wallet balance:', value: `⏣ ${profileData.coins.toLocaleString()}`, inline: true },
            { name: 'New bank balance:', value: `⏣ ${profileData.bank.toLocaleString()}`, inline: true }
        );

        message.channel.send({ embeds: [withEmbed] });
    },
  };