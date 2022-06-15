const addItem = require('../../functions/economy/addItem.js');
const removeItem = require('../../functions/economy/removeItem.js');
const findItem = require('../../functions/economy/findItem.js');

module.exports = {
    name: "generateitem",
    permissions: [],
    aliases: ['genitem', 'itemgen', 'gi'],
    description: "Generates items",
    usage: 'Type in \`{prefix} generateitem\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        if (additionalInput.roles.botManagers.includes(message.author.id)) {
            let count = 1;
            let item = 'diamond'
            if (args[0]) count = parseInt(args[0]);
            if (args[1]) item = args[1];

            const foundItem = await findItem.execute(item);
            if (!foundItem) return message.channel.send('lol that\'s not a valid item, it\'s [amount] [item]');

            if (isNaN(count)) return message.channel.send('that\'s not a number, it\'s [amount] [item]')

            const removeOrAdd = count <= 0 ? removeItem : addItem;
            await removeOrAdd.execute(message.author, profileData, foundItem.name, Math.abs(count), profileModel)
            const addItemEmbed = new Discord.MessageEmbed()
            .setTitle(`Successful ${count < 0 ? 'removal' : 'generate'}`)
            .setColor('GREEN')
            .setDescription(`I ${count < 0 ? 'removed' : 'generated'} **${Math.abs(count).toLocaleString()}x ${foundItem.itemname}${count === 1 ? '' : 's'}** ${count < 0 ? 'from your inventory.' : 'and put it in your inventory.'}`);
            message.reply({ embeds: [addItemEmbed] });
        } else {
            const invalidEmbed = new Discord.MessageEmbed()
            .setTitle('ERROR! YOU ARE NOT A BOT MANAGER!')
            .setColor('RED')
            .setDescription('You are not allowed to generate items!')
            message.channel.send({ embeds: [invalidEmbed] })
        }
    }
}