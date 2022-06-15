module.exports = {
    name: "deposit",
    aliases: ['dep', 'depos'],
    permissions: [],
    description: "Deposit money into your bank.",
    usage: "Type in \`{prefix} deposit [amount]\`",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        if (!args.length) { message.reply('You\'ve got to deposit SOMETHING, am I right?'); return cooldownCheck.cancel(); }

        var depAmount;
        if (args[0] == 'all' || args[0] == 'max') depAmount = profileData.coins;
        else depAmount = parseInt(args[0]);

        if (isNaN(depAmount)) { message.reply(`You have to deposit an actual number lol`); return cooldownCheck.cancel(); }
        if (depAmount < 0) { message.reply(`You can\'t deposit a negative number, do you have any common sense?`); return cooldownCheck.cancel(); }

        if (profileData.coins < depAmount) { message.reply(`You are too poor to deposit this much money XD`); return cooldownCheck.cancel(); }
        if (additionalInput.bankspaceXP(profileData) <= profileData.bank) { message.reply('heya you have a full bank kiddo'); return cooldownCheck.cancel(); } else if (additionalInput.bankspaceXP(profileData) < profileData.bank + depAmount) { depAmount = additionalInput.bankspaceXP(profileData) - profileData.bank; }

        await profileModel.findOneAndUpdate(
            { userID: message.author.id }, 
            { $inc: {
                coins: -depAmount,
                bank: depAmount,
            } }
        );

        profileData = await profileModel.findOne( { userID: message.author.id } );

        const depositEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .addFields(
            { name: 'Deposit Amount', value: `⏣ ${depAmount.toLocaleString()}` },
            { name: 'New wallet balance:', value: `⏣ ${profileData.coins.toLocaleString()}`, inline: true },
            { name: 'New bank balance:', value: `⏣ ${profileData.bank.toLocaleString()}`, inline: true }
        );

        message.channel.send({ embeds: [depositEmbed] });
    },
  };