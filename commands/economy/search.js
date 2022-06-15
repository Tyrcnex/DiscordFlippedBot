const addMoney = require('../../functions/economy/addMoney.js');
const addItem = require('../../functions/economy/addItem.js')
const createButton = require('../../functions/discord/createButton.js');
const findItem = require('../../functions/economy/findItem.js');
const die = require('../../functions/economy/die.js')

module.exports = {
    name: "search",
    aliases: ['scout'],
    permissions: [],
    cooldown: 30,
    cooldownMsg: "You\'ve already scouted the place for coins",
    description: "Search for coins, and possibly items!",
    usage: "Type in \`{prefix} search\`",
    isGrind: true,
    xpAdd: 1,
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        const searchLocations = require('../../jsData/searchLocations.js');
        const randomSearchLocations = searchLocations.sort(() => 0.5 - Math.random()).slice(0,3);

        let id = (index) => `search-${message.author.id}-${Date.now()}-${index}`
        let baseid = id(1).slice(0,-2);
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId(id(0))
                .setLabel(randomSearchLocations[0].name)
                .setStyle('PRIMARY'),
            new Discord.MessageButton()
                .setCustomId(id(1))
                .setLabel(randomSearchLocations[1].name)
                .setStyle('PRIMARY'),
            new Discord.MessageButton()
                .setCustomId(id(2))
                .setLabel(randomSearchLocations[2].name)
                .setStyle('PRIMARY'),
        );

        var startEmbed = new Discord.MessageEmbed()
        .setTitle("Where would you like to search?")
        .setColor('YELLOW')
        .setDescription('\nPick a search location!')
        .setFooter('🤔')

        const theMsg = await message.reply({ embeds: [startEmbed], components: [row] });
        additionalInput.stopUser.set(message.author.id);
        var done = false;

        // Interaction Button
        var collectFunc = async (collector, interaction) => {

            await interaction.deferUpdate();
            await row.components.forEach(int => int.setDisabled());

            // Coins
            var random1 = Math.random();
            var randSI = randomSearchLocations[interaction.customId.slice(-1)]
            var rand = (max, min) => Math.floor(Math.random() * (max - min + 1)) + min
            var randomCoin = rand(randSI.minMax[0],randSI.minMax[1]);
            var newRandomCoin = Math.floor(randomCoin * ((1 + profileData.multi / 100)))

            // Items
            if (randSI.items) { 
                const chances = randSI.items.map(e => e.chance);
                const cumulativeSumF = (sum => value => sum += value)(0);
                var cumulativeSum = chances.map(cumulativeSumF);
                cumulativeSum.unshift(0);

                var random3 = Math.random(); var item;
                for (var i = 0; i < cumulativeSum.length - 1; i++) {
                    if(random3 > cumulativeSum[i] && random3 < cumulativeSum[i + 1]) { item = randSI.items[i]; break; } else continue;
                }
                if (item) item = await findItem.execute(item.name);
            }

            let type = ''

            if (random1 < randSI.chance[0]) type = 'success'; else if (random1 < randSI.chance[0] + randSI.chance[1]) type = 'death'; else type = 'fail';

            // Returned Embed Description
            let embedDescription = ''
            if (type == 'success') { 
                embedDescription = `\n${randSI.success.replace('{.MON}', `⏣ ${newRandomCoin.toLocaleString()}`)}${!!item ? `\n\nYou lucky ducky! You also found a **${!!item.emoji ? item.emoji : ''} ${item.itemname}**` : ''}`
            } else if (type == 'fail') { 
                embedDescription = `${randSI.fail}`;
            } else if (type == 'death') {
                embedDescription = `${randSI.die}`
            }
            if (!!item) await addItem.execute(message.author, profileData, item.name, 1, profileModel)

            // Search embed
            var searchEmbed = new Discord.MessageEmbed()
            .setColor(type == 'success' ? 'GREEN' : 'RED')
            .setTitle(`You searched the *${randSI.name}*`)
            .setDescription(embedDescription)
            .setFooter(type == 'success' ? `Multi bonus: ${profileData.multi}% (⏣ ${(newRandomCoin - randomCoin).toLocaleString()})` : ( type == 'fail' ? 'imagine being so bad' : 'imagine dying' ));

            if (type == 'success') await addMoney.execute(message.author, profileData, newRandomCoin, profileModel);
            if (type == 'death') await die.execute(Discord, profileData, message.author, profileModel, `while searching the ${randSI.name}`, false);


            await theMsg.edit({ embeds: [searchEmbed], components: [row] }); done = true;
            return collector.stop();
        }

        var endFunc = async (collector, interaction) => {

            row.components.forEach(int => int.setDisabled());
            additionalInput.stopUser.delete(message.author.id);
            if (!done) return await theMsg.edit({ content: 'Guess you didn\'t want to search anywhere?', embeds: [startEmbed], components: [row] })

        }

        await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
    },
};