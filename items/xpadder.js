module.exports = {
    name: 'xpadder',
    itemname: 'XP Adder',
    aliases: ['xpadders'],
    active: 600000,
    emoji: `<:XPAdder:974196751789600768>`,
    price: 10500,
    sell: 2350,
    description: 'Just a test active item!',
    multiUse: true,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        changes.activeChanges = [
            { name: 'xpadd', value: 2 }
        ]
        const xpEmbed = new Discord.MessageEmbed()
        .setDescription('Successfully added an xp multiplier of **2**! This will last for 10 minutes.')
        message.reply({ embeds: [xpEmbed] })
        return changes.loss = true;
    }
}