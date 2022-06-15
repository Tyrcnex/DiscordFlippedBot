const detectMention = require("../../functions/discord/detectMention.js")

module.exports = {
    name: "botwipe",
    permissions: [],
    aliases: ['botwpe', 'bw'],
    description: "Bot wipe",
    usage: 'Type in \`{prefix} botwipe\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        if (additionalInput.roles.admins.includes(message.author.id)) {
            let count = await profileModel.countDocuments();
            let user = await detectMention.execute(message, client, args)
            if (user) { await profileModel.deleteOne({ userID: user.id }); count = 1}
            else await profileModel.deleteMany({});
            const botWipeEmbed = new Discord.MessageEmbed()
            .setTitle(`${message.author.username}, I wiped the database.`)
            .setColor('GREEN')
            .setDescription(`Deleted ${count} document${count === 1 ? '' : 's'}.`)
            message.channel.send({ embeds: [botWipeEmbed] });
        } else {
            const invalidEmbed = new Discord.MessageEmbed()
            .setTitle('ERROR! YOU ARE NOT AN ADMIN!')
            .setColor('RED')
            .setDescription('You are not allowed to wipe the bot!')
            message.channel.send({ embeds: [invalidEmbed] })
        }
    }
}