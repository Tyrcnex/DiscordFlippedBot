const detectMention = require('../../functions/discord/detectMention.js')

module.exports = {
    name: "profile",
    aliases: ['prof'],
    permissions: [],
    description: "Checks someone's stats (user profile)",
    usage: "Type in \`{prefix} profile [user]\`",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		const user = await detectMention.execute(message,client,args) || message.author;
        if (!user) { message.reply('Couldn\'t find that user, probably a ghost 👻'); return cooldownCheck.cancel(); }

        const userModel = await profileModel.findOne({ userID: user.id });
        if (!userModel) { message.reply('This user hasn\'t used this bot before, what a loser'); return cooldownCheck.cancel(); }

        const profileEmbed = new Discord.MessageEmbed()
        .setColor('BLACK')
        .setAuthor(`${user.username}'s profile`, user.displayAvatarURL({ format: 'jpg' }))
        .setThumbnail(user.displayAvatarURL({ format: 'jpg' }))
        .addFields(
            { name: 'Level', value: `\`${Math.floor( userModel.xp / 100 ).toLocaleString()}\``, inline: true },
            { name: 'XP', value: `\`${Math.floor(userModel.xp).toLocaleString()} / ${(Math.ceil(userModel.xp / 100 + 0.5) * 100).toLocaleString()}\``, inline: true },
            { name: 'Coins', value: `Wallet: \`${userModel.coins.toLocaleString()}\`\nBank: \`${userModel.bank.toLocaleString()}\``, inline: true },
            { name: 'Inventory', value: `**${userModel.items.length.toLocaleString()}** items (**${userModel.items.reduce((a, b) => a + b.amount, 0).toLocaleString()}** in total)` }
        )
        .setFooter(user.id == message.author.id ? '🤌🏻' : 'lol what a noob')

        message.channel.send({ embeds: [profileEmbed] });
    },
  };