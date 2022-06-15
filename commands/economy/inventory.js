const detectMention = require('../../functions/discord/detectMention.js');
const findItem = require('../../functions/economy/findItem.js');
const createButton = require('../../functions/discord/createButton.js')

module.exports = {
    name: "inventory",
    aliases: ["inv", "backpack", "inven", "inventry"],
    permissions: [],
    description: "This is the inventory command, to check your items.",
    usage: "Type \`{prefix} inventory [user (optional)]\`.",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		const user = await detectMention.execute(message, client, args) || message.author;
        if (!user) { message.reply('Couldn\'t find that user, probably a ghost 👻'); return cooldownCheck.cancel() } ;

        const userModel = await profileModel.findOne({ userID: user.id });
        if (!userModel) { message.reply('This user hasn\'t used this bot before, what a loser'); return cooldownCheck.cancel() } ;

        const items = userModel.items;
		var item_name = [];

        for await (const item of items) {
            var foundItem = await findItem.execute(item.name);
            let obj = {
                name: foundItem.itemname,
                rawname: foundItem.name,
                amount: item.amount,
            };
            if (foundItem.emoji) obj.emoji = foundItem.emoji
            item_name.push(obj);
        }

        if (!item_name.length) { message.reply(user.id == message.author.id ? 'LOL you have nothing in your inventory' : 'Yo this person has nothing for you, move along'); return cooldownCheck.cancel() }
        item_name = item_name.sort((a, b) => (a.name > b.name) ? 1 : -1);

        var page = 1;
        var perPage = 5
        var allowedPages = Math.ceil((item_name.length - 0.5)/ perPage);
        var newItemNames = item_name.slice(perPage * (page - 1), perPage * page);

        let invDescription = ``;
        for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}** — *${item.amount.toLocaleString()}*\nID: \`${item.rawname}\`\n\n` }

        var invEmbed = new Discord.MessageEmbed()
        .setColor('PURPLE')
        .setTitle(`${user.username}'s inventory`)
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

        let messageObj = { embeds: [invEmbed] };
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
                for (const item of newItemNames) { invDescription += `${!!item.emoji ? `${item.emoji} ` : ''}**${item.name}** — *${item.amount.toLocaleString()}*\nID: \`${item.rawname}\`\n\n` }

                invEmbed = new Discord.MessageEmbed()
                .setColor('PURPLE')
                .setTitle(`${user.username}'s inventory`)
                .setDescription(invDescription);

                return await theMsg.edit({ embeds: [invEmbed], components: [row] });
            }

            var endFunc = async (collector, interaction) => {

                row.components.forEach(int => int.setDisabled());
                return await theMsg.edit({ embeds: [invEmbed], components: [row] });

            }

            await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
        }
    },
};