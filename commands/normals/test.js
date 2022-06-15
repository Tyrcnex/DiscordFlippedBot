module.exports = {
    name: "test",
    permissions: [],
    cooldown: 5,
    aliases: [],
    description: "a test",
    usage: 'Type in \`{prefix} test\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        let isTest = false;
        if (isTest === false) {
            const testEmbed = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .addFields(
                {name: 'Whoops...', value: "Sorry, this test command is currently not available!"}
            );
            return message.channel.send( {embeds: [testEmbed]});
        } else {

        }
    }
}