const getItems = require('../../functions/economy/getItems.js');
const findItem = require('../../functions/economy/findItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js')
const addItem = require('../../functions/economy/addItem.js');
const removeItem = require('../../functions/economy/removeItem.js');
const createButton = require('../../functions/discord/createButton.js');

module.exports = {
    name: "enchant",
    aliases: [],
    permissions: [],
    description: "Enchant some items.",
    usage: "Type in \`{prefix} enchant [item] [amount (optional)]\`",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        const item_list = await getItems.execute();

		if (!args.length) {
            var item_name = [];

            for (const item of item_list) {
                if (item.enchant) {
                    let obj = {
                        name: item.itemname,
                        description: item.description,
                    };
                    if (item.emoji) obj.emoji = item.emoji;
                    item_name.push(obj);
                }
            }

            item_name = item_name.sort((a, b) => a.name - b.name);

            var page = 1;
            var perPage = 5;
            var allowedPages = Math.ceil((item_name.length - 0.5)/ perPage);
            var newItemNames = item_name.slice(perPage * (page - 1), perPage * page);

            let invDescription = ``;
            for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}**\n*${item.description}*\n\n` }

            var enchantEmbed = new Discord.MessageEmbed()
            .setColor('PURPLE')
            .setTitle('ENCHANTING')
            .setDescription(invDescription);

            let id = (index) => `enchant-${message.author.id}-${Date.now()}-${index}`
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

            let messageObj = { embeds: [enchantEmbed] };
            if (allowedPages !== 1) messageObj.components = [row]
            let theMsg = await message.reply(messageObj);

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
                    for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}**\n*${item.description}*\n\n` }
    
                    enchantEmbed = new Discord.MessageEmbed()
                    .setColor('PURPLE')
                    .setTitle('ENCHANTING')
                    .setDescription(invDescription);
    
                    return await theMsg.edit({ embeds: [enchantEmbed], components: [row] });
                }
    
                var endFunc = async (collector, interaction) => {
    
                    await row.components.forEach(int => int.setDisabled());
                    messageObj = { embeds: [enchantEmbed] };
                    if (allowedPages !== 1) messageObj.components = [row]
                    return await theMsg.edit(messageObj);
    
                }
    
                await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
            }
        } else {
            let item = args.join(' ');
            let foundItem = await findItem.execute(item);

            if (!foundItem) { message.reply(`lol this isnt an item lol`); return cooldownCheck.cancel(); }
            let getFoundItem = await getItemInventory.execute(profileData, foundItem.name);
            if (!getFoundItem) { message.reply(`You don't have this item!`); return cooldownCheck.cancel(); }
            if (!foundItem.enchant) { message.reply(`This item isn\'t enchantable!`); return cooldownCheck.cancel(); }
            
            let getReturnedItem = await findItem.execute(foundItem.enchant.returnedItem);
            let enchantinggem = await findItem.execute('enchantinggem')
            let getEnchantingGem = await getItemInventory.execute(profileData, 'enchantinggem');
            let amountEnchantingGem = !!getEnchantingGem ? getEnchantingGem.amount : 0;
            let isEnchantingGem = amountEnchantingGem >= foundItem.enchant.enchantinggem;
            let isXP = profileData.xp >= foundItem.enchant.xp;

            let enchantPreviewDescription = `Enchanting into: ${!!getReturnedItem.emoji ? getReturnedItem.emoji + ' ' : ''}**${getReturnedItem.itemname}**\n\nEnchantable with:\n\n**${!!enchantinggem.emoji ? enchantinggem.emoji + ' ' : ''}${foundItem.enchant.enchantinggem.toLocaleString()}x ${enchantinggem.itemname}**\n\nor:\n\n**${foundItem.enchant.xp} XP**`;

            const enchantPreviewEmbed = new Discord.MessageEmbed()
            .setColor('PURPLE')
            .setTitle(`ENCHANTING ${!!foundItem.emoji ? foundItem.emoji + ' ' : ''}${foundItem.itemname.toUpperCase()}`)
            .setDescription(enchantPreviewDescription);

            let id = (index) => `enchantnew-${message.author.id}-${Date.now()}-${index}`
            let baseid = id(1).slice(0,-2);
            let messageObj = {};
            messageObj.embeds = [enchantPreviewEmbed];
            messageObj.components = [new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton()
                .setLabel('ENCHANT WITH ENCHANTING GEM')
                .setStyle('SUCCESS')
                .setCustomId(id(1))
                .setDisabled(!isEnchantingGem),
                new Discord.MessageButton()
                .setLabel(`ENCHANT WITH XP`)
                .setStyle('SUCCESS')
                .setCustomId(id(2))
                .setDisabled(!isXP)
            )];

            let theMsg = await message.reply(messageObj);
            if (isEnchantingGem || isXP) additionalInput.stopUser.set(message.author.id);

            const confirmenchant = async () => {
                let desc = `Are you sure you want to enchant:\n\n${!!foundItem.emoji ? foundItem.emoji + ' ' : ''}**${foundItem.itemname}**\n\ninto: \n\n${!!getReturnedItem.emoji ? getReturnedItem.emoji + ' ' : ''}**${getReturnedItem.itemname}**\n\nwith:\n\n${type === 'xp' ? foundItem.enchant.xp.toLocaleString() + ' XP' : `**${!!enchantinggem.emoji ? enchantinggem.emoji + ' ' : ''}${foundItem.enchant.enchantinggem.toLocaleString()} ${enchantinggem.itemname}**`}?`;
                
                let confirmationenchantEmbed = new Discord.MessageEmbed()
                .setTitle(`⚠️ ENCHANT CONFIRMATION ⚠️`)
                .setDescription(desc)

                let id = (index) => `enchantconfirm-${message.author.id}-${Date.now()}-${index}`
                let baseid = id(1).slice(0,-2);
                let row = new Discord.MessageActionRow().addComponents(
                    new Discord.MessageButton()
                    .setLabel('CONFIRM')
                    .setStyle('SUCCESS')
                    .setCustomId(id(1)),
                    new Discord.MessageButton()
                    .setLabel('CANCEL')
                    .setStyle('DANGER')
                    .setCustomId(id(2))
                );

                let messageObj = { embeds: [confirmationenchantEmbed], components: [row] }
                let theMsg = await message.reply(messageObj);
                let confirm = false;
                additionalInput.stopUser.set(message.author.id);

                // Interaction Button
                var collectFunc = async (collector, interaction) => {
                    await interaction.deferUpdate();

                    if (!interaction.customId.startsWith('enchantconfirm')) return;
                    if (interaction.customId.slice(-1) == 1) confirm = true;
    
                    collector.stop();
                }
    
                var endFunc = async (collector, interaction) => {
                    messageObj.components[0].components.forEach(int => int.setDisabled());
                    await theMsg.edit(messageObj);
                    if (!confirm) return message.reply('I guess that\'s a no, bro')
                    else {
                        await addItem.execute(message.author, profileData, foundItem.enchant.returnedItem, 1, profileModel);
                        await removeItem.execute(message.author, profileData, foundItem.name, 1, profileModel)
                        if (type == 'xp') {
                            await profileModel.findOneAndUpdate({ userID: message.author.id }, { $inc: {
                                xp: -foundItem.enchant.xp
                            }})
                        } else {
                            await removeItem.execute(message.author, profileData, 'enchantinggem', foundItem.enchant.enchantinggem, profileModel);
                        }
                        message.reply(`Successful enchant`)
                    }
                    additionalInput.stopUser.delete(message.author.id);
                }
    
                await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
            }

            // Interaction Button
            var collectFunc = async (collector, interaction) => {
                await interaction.deferUpdate();

                if (!interaction.customId.startsWith('enchantnew')) return;
                if (interaction.customId.slice(-1) == 1) type = 'gem';
                else if (interaction.customId.slice(-1) == 2) type = 'xp';

                collector.stop();
                additionalInput.stopUser.delete(message.author.id);
                return await confirmenchant();
            }

            var endFunc = async (collector, interaction) => {
                messageObj.components[0].components.forEach(int => int.setDisabled());
                await theMsg.edit(messageObj);
                return additionalInput.stopUser.delete(message.author.id);
            }

            await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
        }
    },
};