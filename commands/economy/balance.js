const detectMention = require('../../functions/discord/detectMention.js')

module.exports = {
    name: "balance",
    aliases: ['bal', 'wallet'],
    permissions: [],
    description: "Check how much money you have",
    usage: "Type in \`{prefix} balance [user (optional)]\`",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		const user = await detectMention.execute(message,client,args) || message.author;
        if (!user) { message.reply('Couldn\'t find that user, probably a ghost 👻'); return cooldownCheck.cancel(); }

        const userModel = await profileModel.findOne({ userID: user.id });
        if (!userModel) { message.reply('This user hasn\'t used this bot before, what a loser'); return cooldownCheck.cancel(); }

        const balanceEmbed = new Discord.MessageEmbed()
        .setTitle(`${user.username}'s balance`)
        .setColor('BLUE')
        .setDescription( `**Wallet:** ⏣ ${userModel.coins.toLocaleString()}\n**Bank:** ⏣ ${userModel.bank.toLocaleString()} / ${additionalInput.bankspaceXP(userModel).toLocaleString()} \`${(100*(userModel.bank / additionalInput.bankspaceXP(userModel))).toFixed(1).toString()}%\`\n**Net worth:** ⏣ ${(await additionalInput.net(userModel)).toLocaleString()}`)
        .setFooter(user.id == message.author.id ? '🤌🏻' : 'lol what a noob');

        message.channel.send({ embeds: [balanceEmbed] });
    },
  };