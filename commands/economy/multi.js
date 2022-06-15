const multiList = require('../../jsData/multiList.js');

module.exports = {
    name: "multiplier",
    aliases: ['mulitpliers', 'multi'],
    permissions: [],
    description: "Check your multi",
    usage: "Type in \`{prefix} multi\`",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        var description = ``;
        for await (var multiVal of multiList) {
            if (await multiVal.value(profileData) !== 0) description += `${multiVal.name} \`${await multiVal.value(profileData)}%\`${!isNaN(multiVal.max) ? ` (max \`${multiVal.max.toLocaleString()}%\`)` : ``}\n`
        }

		const multiEmbed = new Discord.MessageEmbed()
        .setTitle(`${message.author.username}'s multis (Total \`${profileData.multi}%\`)`)
        .setColor('BLACK')
        .setDescription(description)

        message.channel.send({ embeds: [multiEmbed] });
    },
  };