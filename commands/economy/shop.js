const getItems = require('../../functions/economy/getItems.js');
const findItem = require('../../functions/economy/findItem.js')
const createButton = require('../../functions/discord/createButton.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js');

module.exports = {
    name: "shop",
    aliases: ["itemshop", "item"],
    permissions: [],
    description: "This is the shop command. Shop for items here!",
    usage: "Type \`{prefix} shop [item (optional)]\`.",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        const item_list = await getItems.execute();

        if (!args.length) {
            var item_name = [];

            for (const item of item_list) {
                if (item.price) {
                    let obj = {
                        name: item.itemname,
                        description: item.description,
                        price: item.price,
                    };
                    if (item.emoji) obj.emoji = item.emoji;
                    item_name.push(obj);
                }
            }

            item_name = item_name.sort((a, b) => a.price - b.price);

            var page = 1;
            var perPage = 4;
            var allowedPages = Math.ceil((item_name.length - 0.5)/ perPage);
            var newItemNames = item_name.slice(perPage * (page - 1), perPage * page);

            let invDescription = ``;
            for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}** - ⏣ ${item.price.toLocaleString()}\n*${item.description}*\n\n` }

            var shopEmbed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle('SHOP')
            .setDescription(invDescription);

            let id = (index) => `inventory-${message.author.id}-${Date.now()}-${index}`
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
            const theMsg = await message.reply(messageObj);
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
                    for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}** - ⏣ ${item.price.toLocaleString()}\n*${item.description}*\n\n` }
    
                    var shopEmbed = new Discord.MessageEmbed()
                    .setColor('GREEN')
                    .setTitle('SHOP')
                    .setDescription(invDescription);
    
                    return await theMsg.edit({ embeds: [shopEmbed], components: [row] });
                }
    
                var endFunc = async (collector, interaction) => {
    
                    await row.components.forEach(int => int.setDisabled());
                    messageObj = { embeds: [shopEmbed] };
                    if (allowedPages !== 1) messageObj.components = [row]
                    return await theMsg.edit(messageObj);
    
                }
    
                await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
            }
        } else {
            const inputItem = args.join(' ');
            const item = await findItem.execute(inputItem);
            if (!item) { message.reply('that item doesn\'t exist what are you doing lol'); return cooldownCheck.cancel() }
            
            let itemFind = await getItemInventory.execute(profileData, item.name)
            let noItems;
            if (!itemFind) noItems = 0;
            else noItems = itemFind.amount;

            var itemEmbed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`${item.itemname} (${noItems.toLocaleString()} owned)`)
            .setDescription(`> ${item.description}\n\n**BUY** - ${!!item.price ? `⏣ ${item.price.toLocaleString()}` : 'Unable to be bought'}\n**SELL** - ${!!item.sell ? `⏣ ${item.sell.toLocaleString()}` : 'Unable to be sold'}`);

            if (item.emoji) itemEmbed.setThumbnail(`https://cdn.discordapp.com/emojis/${item.emoji.split(':')[2].replace('>','')}.${item.emoji.charAt(1) === 'a' ? 'gif' : 'png'}`);
            

            message.reply({ embeds: [itemEmbed] });
        }
    },
};