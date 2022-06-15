const getItems = require('../../functions/economy/getItems.js');
const findItem = require('../../functions/economy/findItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js')
const addItem = require('../../functions/economy/addItem.js');
const removeItem = require('../../functions/economy/removeItem.js');
const createButton = require('../../functions/discord/createButton.js');

module.exports = {
    name: "craft",
    aliases: [],
    permissions: [],
    description: "Craft some items, so you don\'t have to grind or buy them!",
    usage: "Type in \`{prefix} craft [item] [amount (optional)]\`",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        const item_list = await getItems.execute();

		if (!args.length) {
            var item_name = [];

            for (const item of item_list) {
                if (item.craft) {
                    let obj = {
                        name: item.itemname,
                        description: item.description,
                    };
                    if (item.emoji) obj.emoji = item.emoji;
                    item_name.push(obj);
                }
            }

            item_name = item_name.sort((a, b) => a.itemname - b.itemname);

            var page = 1;
            var perPage = 5;
            var allowedPages = Math.ceil((item_name.length - 0.5)/ perPage);
            var newItemNames = item_name.slice(perPage * (page - 1), perPage * page);

            let invDescription = ``;
            for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}**\n*${item.description}*\n\n` }

            var craftEmbed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTitle('CRAFTING')
            .setDescription(invDescription);

            let id = (index) => `craft-${message.author.id}-${Date.now()}-${index}`
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

            let messageObj = { embeds: [craftEmbed] };
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
    
                    craftEmbed = new Discord.MessageEmbed()
                    .setColor('BLUE')
                    .setTitle('CRAFTING')
                    .setDescription(invDescription);
    
                    return await theMsg.edit({ embeds: [craftEmbed], components: [row] });
                }
    
                var endFunc = async (collector, interaction) => {
    
                    await row.components.forEach(int => int.setDisabled());
                    messageObj = { embeds: [craftEmbed] };
                    if (allowedPages !== 1) messageObj.components = [row]
                    return await theMsg.edit(messageObj);
    
                }
    
                await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
            }
        } else {
            let amount = parseInt(args[args.length - 1]) || 'none';
            let item = args;
            if (amount !== 'none') item = item.slice(0,-1);
            let foundItem = await findItem.execute(item.join(' '));

            if (!foundItem) { message.reply(`lol this isnt an item lol`); return cooldownCheck.cancel(); }
            if (!foundItem.craft) { message.reply(`This item isn\'t craftable!`); return cooldownCheck.cancel(); }
            if (amount !== 'none' && amount < 0) { message.reply(`That\'s an invalid amount of items!`); return cooldownCheck.cancel(); }
            
            if (amount === 'none') {
                let craftPreviewDescription = ``;
                var craftMax = Infinity;
                for await (var craftObj of foundItem.craft) {
                    let craftFoundItem = await findItem.execute(craftObj.name);
                    let inventoryFoundItem = await getItemInventory.execute(profileData, craftFoundItem.name)
                    let inventoryFoundItemAmount = 0;
                    if (!!inventoryFoundItem) inventoryFoundItemAmount = inventoryFoundItem.amount;
                    if (craftMax > Math.floor(inventoryFoundItemAmount/craftObj.amount)) craftMax = Math.floor(inventoryFoundItemAmount/craftObj.amount);

                    craftPreviewDescription += `${!!craftFoundItem.emoji ? craftFoundItem.emoji + ' ' : ''}\`${inventoryFoundItemAmount}/${craftObj.amount}\`${inventoryFoundItemAmount < craftObj.amount ? `**${craftFoundItem.itemname}**` : craftFoundItem.itemname}\n`
                }

                const craftPreviewEmbed = new Discord.MessageEmbed()
                .setColor('BLUE')
                .setTitle(`CRAFTING ${foundItem.itemname.toUpperCase()}`)
                .setDescription(craftPreviewDescription);

                let id = (index) => `craftnew-${message.author.id}-${Date.now()}-${index}`
                let baseid = id(1).slice(0,-2);
                let messageObj = {};
                messageObj.embeds = [craftPreviewEmbed];
                messageObj.components = [new Discord.MessageActionRow().addComponents(
                    new Discord.MessageButton()
                    .setLabel('CRAFT ONE')
                    .setStyle('SUCCESS')
                    .setCustomId(id(1))
                    .setDisabled(craftMax === 0),
                    new Discord.MessageButton()
                    .setLabel(`CRAFT MAX (${craftMax})`)
                    .setStyle('SUCCESS')
                    .setCustomId(id(2))
                    .setDisabled(craftMax === 0)
                )];

                if (craftMax !== 0) additionalInput.stopUser.set(message.author.id);

                let theMsg = await message.reply(messageObj);

                const confirmCraft = async () => {
                    let newItemObj = foundItem.craft.map(e => { return { name: e.name, amount: e.amount * amount } })
                    if (craftMax < amount) return message.reply(`You don\'t have enough materials to craft ${amount.toLocaleString()}x ${foundItem.itemname}!`)
    
                    let desc = `Are you sure you want to craft:\n\n${!!foundItem.emoji ? foundItem.emoji + ' ' : ''}\`${amount.toLocaleString()}x\` **${foundItem.itemname}**\n\nfrom:\n\n`;
                    for await (var newItem of newItemObj) {
                        var newItemFound = await findItem.execute(newItem.name);
                        desc += `${!!newItemFound.emoji ? newItemFound.emoji + ' ' : ''}\`${newItem.amount}x\` **${newItemFound.itemname}**\n`
                    }
                    
                    let confirmationCraftEmbed = new Discord.MessageEmbed()
                    .setTitle(`⚠️ CRAFT CONFIRMATION ⚠️`)
                    .setDescription(desc)
    
                    let id = (index) => `craftconfirm-${message.author.id}-${Date.now()}-${index}`
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
    
                    let messageObj = { embeds: [confirmationCraftEmbed], components: [row] }
                    let theMsg = await message.reply(messageObj);
                    let confirm = false;
                    additionalInput.stopUser.set(message.author.id);
    
                    // Interaction Button
                    var collectFunc = async (collector, interaction) => {
                        await interaction.deferUpdate();
    
                        if (!interaction.customId.startsWith('craftconfirm')) return;
                        if (interaction.customId.slice(-1) == 1) confirm = true;
        
                        collector.stop();
                    }
        
                    var endFunc = async (collector, interaction) => {
                        messageObj.components[0].components.forEach(int => int.setDisabled());
                        await theMsg.edit(messageObj);
                        if (!confirm) return message.reply('I guess that\'s a no, bro')
                        else {
                            await addItem.execute(message.author, profileData, foundItem.name, amount, profileModel);
                            for await (var newItem of newItemObj) {
                                let foundNewItem = await findItem.execute(newItem.name)
                                await removeItem.execute(message.author, profileData, foundNewItem.name, newItem.amount, profileModel);
                            }
                            message.reply(`Successful craft`)
                            additionalInput.stopUser.delete(message.author.id);
                        }
                    }
        
                    await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
                }

                // Interaction Button
                var collectFunc = async (collector, interaction) => {
                    await interaction.deferUpdate();

                    if (!interaction.customId.startsWith('craftnew')) return;
                    if (interaction.customId.slice(-1) == 1) amount = 1;
                    else if (interaction.customId.slice(-1) == 2) amount = craftMax;
    
                    collector.stop();
                    additionalInput.stopUser.set(message.author.id);
                    return await confirmCraft();
                }
    
                var endFunc = async (collector, interaction) => {
                    messageObj.components[0].components.forEach(int => int.setDisabled());
                    await theMsg.edit(messageObj);
                    return additionalInput.stopUser.delete(message.author.id);
                }
    
                await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
            } else await confirmCraft();
        }
    },
};