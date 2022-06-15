module.exports = {
    name: "rich",
    aliases: ["top", "ric"],
    permissions: [],
    description: "This is the rich command. You can see who has a lot of money here!",
    usage: "Type \`{prefix} rich\`.",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        var members = await message.guild.members.cache.map(member => member.user.id);
        var trueFalse = [];
        for await (var member of members) {
            const exists = await profileModel.exists({ userID: member });
            var data = exists === true ? await profileModel.findOne({ userID: member }) : undefined
            if (exists) 
            trueFalse.push({
                existance: exists,
                data: data,
            });
        }
        var botMembers = await trueFalse.filter(e => e.existance === true).map(e => e.data);
        if (!botMembers.length) { message.reply('Either no one in this server has used this bot before, or the users aren\'t cached.'); return cooldownCheck.cancel() };

        const sortedBotMembers = botMembers.sort((a, b) => (a.coins > b.coins) ? -1 : 1);
        const infoMember = sortedBotMembers.map(e => { return { name: e.username, coins: e.coins, id: e.userID } })
        var description = ``;
        for (var member of infoMember) {
            description += `#${infoMember.indexOf(member) + 1}: **${member.name}** - ⏣ ${member.coins.toLocaleString()}\n`
        }
        const rank = infoMember.findIndex(member => member.id === message.author.id)

        const richEmbed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setTitle(`Richest members in ${message.guild.name}`)
        .setDescription(description)
        .setFooter(`You are #${(rank + 1).toLocaleString()} on the list.`)

        message.reply({ embeds: [richEmbed] });
    },
};