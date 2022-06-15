const detectMention = require("../../functions/discord/detectMention.js")

module.exports = {
    name: "documentchange",
    permissions: [],
    aliases: ['dc'],
    description: "Edits documents",
    usage: 'Type in \`{prefix} documentchange\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        if (additionalInput.roles.admins.includes(message.author.id)) {
            if (args.length < 2) return message.channel.send('There\'s nothing lol')
            let property = args[0];
            let user = (await detectMention.execute(message, client, args)) || message.author;
            let value = args.slice(...(user.id === message.author.id ? [1] : [1, -1])).join(' ');
            let userData = await profileModel.findOne({ userID: user.id })

            if (userData[property] !== undefined) {
                await profileModel.findOneAndUpdate({ userID: user.id }, {
                    [property]: JSON.parse(value)
                })
            } else {
                return message.channel.send('This user doesn\'t have this property!')
            }

            message.channel.send(`Successfully changed the \`${property}\` property to \`${value}\`${user.id === message.author.id ? '' : ` for ${user.username}`}`)
        } else {
            const invalidEmbed = new Discord.MessageEmbed()
            .setTitle('ERROR! YOU ARE NOT AN ADMIN!')
            .setColor('RED')
            .setDescription('You are not allowed to edit documents!')
            message.channel.send({ embeds: [invalidEmbed] })
        }
    }
}