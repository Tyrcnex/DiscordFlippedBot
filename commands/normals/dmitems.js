const getItems = require('../../functions/economy/getItems.js');
const createButton = require('../../functions/discord/createButton.js')

module.exports = {
    name: "dmitems",
    permissions: [],
    cooldown: 5,
    aliases: ['dmitem'],
    description: "DMs you all the items of the bot!",
    usage: 'Type in \`{prefix} dmitems\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        const item_list = await getItems.execute();

        var item_name = [];

        for (const item of item_list) {
            let obj = {
                raw: item.name,
                name: item.itemname,
                description: item.description,
                price: item.price,
            };
            if (item.emoji) obj.emoji = item.emoji;
            item_name.push(obj);
        }

        item_name = item_name.sort((a, b) => a.itemname - b.itemname);

        var page = 1;
        var perPage = 6;
        var allowedPages = Math.ceil((item_name.length - 0.5)/ perPage);
        var newItemNames = item_name.slice(perPage * (page - 1), perPage * page);

        let invDescription = ``;
        for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}**\n*${item.description}* (\`ID: ${item.raw}\`)\n\n` }

        var shopEmbed = new Discord.MessageEmbed()
        .setColor('BLACK')
        .setTitle('ITEMS')
        .setDescription(`Here are the items, some have emojis for reference. If you can't see the emojis clearly just run \`rev shop [item]\`\n\n` + invDescription);

        let id = (index) => `dmitems-${message.author.id}-${Date.now()}-${index}`
        let baseid = id(1).slice(0,-2);
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId(id(0))
                .setLabel('<')
                .setStyle('PRIMARY')
                .setDisabled(true),
            new Discord.MessageButton()
                .setCustomId(id(1))
                .setLabel('>')
                .setStyle('PRIMARY'),
        );

        let messageObj = { embeds: [shopEmbed] };
        if (allowedPages !== 1) messageObj.components = [row]
        const theMsg = await message.author.send(messageObj);
        if (allowedPages !== 1) {
            // Interaction Button
            var collectFunc = async (collector, interaction) => {
                await interaction.deferUpdate();

                let interactionLR = parseInt(interaction.customId.substr(-1)) * 2 - 1;
                page += interactionLR;

                await row.components[0].setDisabled(page <= 1 ? true : false);
                await row.components[1].setDisabled(page >= allowedPages ? true : false);

                var newItemNames = item_name.slice(perPage * (page - 1), perPage * page);
                invDescription = ``;
                for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}**\n*${item.description}* (\`ID: ${item.raw}\`)\n\n` }

                var shopEmbed = new Discord.MessageEmbed()
                .setColor('BLACK')
                .setTitle('ITEMS')
                .setDescription(`Here are the items, some have emojis for reference. If you can't see the emojis clearly just run \`rev shop [item]\`\n\n` + invDescription);

                return await theMsg.edit({ embeds: [shopEmbed], components: [row] });
            }

            var endFunc = async (collector, interaction) => {

                await row.components.forEach(int => int.setDisabled());
                messageObj = { embeds: [shopEmbed] };
                if (allowedPages !== 1) messageObj.components = [row]
                return await theMsg.edit(messageObj);

            }

            await createButton.execute(Discord, client, message, message.author, 75, baseid, collectFunc, endFunc, theMsg)
        }
    }
}