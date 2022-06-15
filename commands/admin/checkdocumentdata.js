const detectMention = require("../../functions/discord/detectMention.js")

module.exports = {
    name: "checkdocumentdata",
    permissions: [],
    aliases: ['cdd'],
    description: "Checks document data",
    usage: 'Type in \`{prefix} botwipe\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        if (additionalInput.roles.admins.includes(message.author.id)) {
            let user = (await detectMention.execute(message, client, args)) || message.author;
            let userData = await profileModel.findOne({ userID: user.id })
            let stringJSON = JSON.stringify(userData, null, 4);
            let newJSON = stringJSON.match(/(.|[\r\n]){1,1990}/g);
            for (let json of newJSON) message.channel.send(`\`\`\`${json}\`\`\``);
        } else {
            const invalidEmbed = new Discord.MessageEmbed()
            .setTitle('ERROR! YOU ARE NOT AN ADMIN!')
            .setColor('RED')
            .setDescription('You are not allowed to check document data!')
            message.channel.send({ embeds: [invalidEmbed] })
        }
    }
}