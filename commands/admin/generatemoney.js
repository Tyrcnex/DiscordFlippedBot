const addMoney = require('../../functions/economy/addMoney.js')

module.exports = {
    name: "generatemoney",
    permissions: [],
    aliases: ['genmon', 'printmoney', 'genmoney', 'gencoin', 'generatecoin', 'coingen', 'moneygen', 'gc', 'gm'],
    description: "Gets the emojis",
    usage: 'Type in \`{prefix} generatemoney\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        if (additionalInput.roles.botManagers.includes(message.author.id)) {
            let count = 1;
            if (args[0]) count = parseInt(args[0]);
            await addMoney.execute(message.author, profileData, count, profileModel);
            const addMoneyEmbed = new Discord.MessageEmbed()
            .setTitle('Successful print')
            .setColor('GREEN')
            .setDescription(`I generated ⏣ ${count.toLocaleString()} and put it in your wallet.`);
            message.reply({ embeds: [addMoneyEmbed] });
        } else {
            const invalidEmbed = new Discord.MessageEmbed()
            .setTitle('ERROR! YOU ARE NOT A BOT MANAGER!')
            .setColor('RED')
            .setDescription('You are not allowed to add money!')
            message.channel.send({ embeds: [invalidEmbed] })
        }
    }
}