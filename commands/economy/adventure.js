const addItem = require('../../functions/economy/addItem.js');
const removeItem = require('../../functions/economy/removeItem.js');
const addMoney = require('../../functions/economy/addMoney.js')
const findItem = require('../../functions/economy/findItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js');
const createButton = require('../../functions/discord/createButton.js');

module.exports = {
    name: "adventure",
    aliases: ['adv'],
    permissions: [],
    description: "Let's go on an adventure!",
    usage: "Type in \`{prefix} adventure\`",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        let id = (index, name) => `${name}-${message.author.id}-${Date.now()}-${index}`
        let advId = (index, name) => id(index, `${name}_adventure`)
        let baseid = advId(0, '').slice(0,-2);
        const adventureData = require('../../jsData/adventureData.js');

        const getDataItems = async (items) => {
            let list = [];
            for await (var item of items) {
                let receivedItem = await findItem.execute(item);
                list.push(receivedItem);
            }
            return list.map(e => (!!e.emoji ? e.emoji : undefined)).filter(e => e !== undefined);
        };

        additionalInput.stopUser.set(message.author.id);

        if (profileData.adventure[1] === false) {
            const selectMenuData = adventureData.map(e => { return { label: e.adventureName, description: e.description, value: e.name } })
            let defaultMenuData = selectMenuData;
            defaultMenuData[0].default = true;

            const firstDataItems = await getDataItems(adventureData[0].items.map(e => e.name));

            const mainSelectMenu = new Discord.MessageActionRow().addComponents(
                new Discord.MessageSelectMenu()
                .setCustomId(advId(0, '_mainSelectMenu'))
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Choose an adventure')
                .addOptions(defaultMenuData),
            );
            const mainButtons = new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton()
                .setCustomId(advId(0, '_mainButtonConfirm'))
                .setLabel('CONFIRM')
                .setStyle('SUCCESS'),
                new Discord.MessageButton()
                .setCustomId(advId(0, '_mainButtonCancel'))
                .setLabel('CANCEL')
                .setStyle('SECONDARY'),
            );
            let adventureMainEmbed = new Discord.MessageEmbed()
            .setColor('BLACK')
            .setDescription('Choose an adventure:')
            .addFields(
                { name: 'Name:', value: adventureData[0].adventureName, inline: true },
                { name: 'Description:', value: adventureData[0].description, inline: true },
                { name: 'Allowed Items:', value: (!(firstDataItems === undefined || firstDataItems.length === 0) ? firstDataItems.join(' ') : 'No items in this adventure!'), inline: true },
            );

            let adventureSecondaryEmbed = new Discord.MessageEmbed()
            .setColor('BLACK')
            .setTitle(`${message.author.username}, choose the items that you want to take with you.`)
            .setDescription(`Items can boost the amount of money you get!`);

            const createEmojiRows = async (items) => {
                var getItems = [];
                for await (var item of items) {
                    let itemFound = await findItem.execute(item);
                    getItems.push(itemFound);
                }
                let truncatedItems = getItems.filter(e => e !== undefined).slice(0,20)
                let rowList = [];
                for (let i = 0; i < Math.ceil(truncatedItems.length/5); i++){
                    let ithItems = truncatedItems.slice(5*i, 5*i+5);
                    let buttonList = [];
                    for (let ithItem in ithItems){
                        buttonList.push(new Discord.MessageButton()
                        .setCustomId(advId(parseInt(ithItem)+5*i, '_itemSelect_'+ithItems[ithItem].name))
                        .setEmoji(ithItems[ithItem].emoji.split(':')[2].replaceAll('>', ''))
                        .setStyle('SECONDARY')
                        .setDisabled(!(await getItemInventory.execute(profileData, ithItems[ithItem].name))));
                    }
                    rowList.push(new Discord.MessageActionRow().addComponents(...buttonList));
                } return rowList;
            }

            var theMsg = await message.reply({ embeds: [adventureMainEmbed], components: [mainSelectMenu, mainButtons] });

            var filter = async interaction => { 
                if (interaction.user.id === message.author.id) return true;
                return await interaction.reply({ content: 'This is not for you.', ephemeral: true })
            }

            const collector = theMsg.createMessageComponentCollector({
                filter,
                idle: 15 * 1000,
            });

            let adventureChose = ''
            let adventureFind = adventureData[0];
            let rows;

            collector.on('collect', async interaction => {
                try {
                    await interaction.deferUpdate();

                    if (interaction.isSelectMenu()) { 
                        adventureChose = interaction.values[0];
                        adventureFind = adventureData.find(e => e.name === adventureChose);
                        adventureMainEmbed[0].value = adventureFind.adventureName;
                        adventureMainEmbed[1].value = adventureFind.description;
                        const emojiItems = await getDataItems(adventureFind.items);
                        if (!emojiItems.length) adventureMainEmbed[2].value = '?'
                        else adventureMainEmbed[2].value = await getDataItems(adventureFind.items).join(' ');
                        if (adventureMainEmbed[2].value)
                        return await theMsg.edit({ embeds: [adventureMainEmbed], components: [mainSelectMenu, mainButtons] })
                    }
                    if (interaction.isButton()) {
                        if (interaction.customId.startsWith('_mainButtonConfirm')) { 
                            rows = await createEmojiRows(adventureFind.items.map(e => e.name));
                            rows.push(new Discord.MessageActionRow().addComponents(
							   new Discord.MessageButton()
                                 .setCustomId(advId(0, '_secondaryButtonSelectAll'))
                                 .setStyle('PRIMARY')
                                 .setLabel('SELECT ALL'),
                                new Discord.MessageButton()
                                .setCustomId(advId(0, '_secondaryButtonConfirm'))
                                .setStyle('SUCCESS')
                                .setLabel('CONFIRM'),
                                new Discord.MessageButton()
                                .setCustomId(advId(0, '_secondaryButtonCancel'))
                                .setStyle('SECONDARY')
                                .setLabel('CANCEL'),
                            ));
                            return await theMsg.edit({ embeds: [adventureSecondaryEmbed], components: rows });
                        } else if (interaction.customId.startsWith('_itemSelect')) {
                            if (rows) {
                                let interactionCustomId = parseInt(interaction.customId.split('-')[3]);
                                let selectedButton = rows[Math.floor(interactionCustomId/5)].components[interactionCustomId % 5];
                                if (selectedButton.style === 'SECONDARY') rows[Math.floor(interactionCustomId/5)].components[interactionCustomId % 5].setStyle('SUCCESS');
                                else rows[Math.floor(interactionCustomId/5)].components[interactionCustomId % 5].setStyle('SECONDARY');
                                return await theMsg.edit({ embeds: [adventureSecondaryEmbed], components: rows });
                            }
                        } else if (interaction.customId.startsWith('_secondaryButtonSelectAll')) {
						if (rows) {
							for (let row of rows.slice(0, -1)) {
								for (let button of row.components) {
									if (button.disabled === false) button.setStyle('SUCCESS');
								}
							}
							return await theMsg.edit({ embeds: [adventureSecondaryEmbed], components: rows });
						}
                        } else if (interaction.customId.startsWith('_secondaryButtonConfirm')) {
                            collector.stop();
                            var backpack = [];
                            for (let row of rows.slice(0, -1)) {
                                for (let button of row.components) {
                                    if (button.style === 'SUCCESS') {
                                        var itemName = button.customId.split('-')[0].replace('_itemSelect_', '').replace('_adventure', '');
                                        var item = await findItem.execute(itemName);
                                        if (item) backpack.push(adventureFind.items.find(e => e.name === itemName));
                                    }
                                }
                            }
                            let order = [...Array(adventureFind.stages.length).keys()].sort(() => 0.5 - Math.random()).slice(0,5);
                            order = order.concat([...Array(adventureFind.neutral.length).keys()].sort(() => 0.5 - Math.random()).map(e => e + adventureFind.stages.length))
                            await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                                $set: {
                                    adventure: [1, true, adventureFind.name],
                                    adventureBackpack: backpack,
                                    adventureStageOrder: order,
                                }
                            });
                            for (var item of backpack.map(e => e.name)) {
                                await removeItem.execute(message.author, profileData, item, 1, profileModel);
                            }
                            profileData = await profileModel.findOne({ userID: message.author.id });
                            await createAdventureMessage();
                        } else if (interaction.customId.startsWith('_mainButtonCancel') || interaction.customId.startsWith('_secondaryButtonCancel')) { 
                            profileData = await profileModel.findOne({ userID: message.author.id });
                            return collector.stop();
                        }
                    }
                } catch (err) { message.channel.send(`Error! Error log:\n\n\`\`\`\n${err}\n\`\`\``); console.error(err) }
            })

            collector.on('end', async interaction => {
                try {
                    if (profileData.adventure[0] === -1) {
                        [mainSelectMenu, mainButtons].forEach(e => e.components.forEach(int => int.setDisabled(true)));
                        await theMsg.edit({ embeds: [adventureMainEmbed], components: [mainSelectMenu, mainButtons] });
                    } else {
                        
                    }
                    additionalInput.stopUser.delete(message.author.id);
                } catch (err) {}
            });
        } else {
            await createAdventureMessage();
        }

        async function createAdventureMessage() {
            const getStageString = (stage) => {
                let string = ``;
                for (var i = 0; i < 5; i++) {
                    if (i === stage) string += `🎒 - `; else string += `⦾ - `
                }
                return string.slice(0, -3);
            }

            if (Date.now() - profileData.lastAdventure < 300000 && message.author.id !== '801715615424315432') return message.reply({ embeds: [new Discord.MessageEmbed()
                .setColor('BLACK')
                .setDescription(`Your next adventure is ready <t:${Math.floor((profileData.lastAdventure + 300000)/1000)}:R>`)
            ]})
            var advFind = adventureData.find(e => e.name == profileData.adventure[2]);
            var randomStage = profileData.adventureStageOrder[Math.floor(Math.random() * profileData.adventureStageOrder.length)];
            if (!randomStage) randomStage = 0;
            let get5StageString = getStageString(5 - profileData.adventureStageOrder.filter(e => e < advFind.stages.length).length)
            if (randomStage >= advFind.stages.length) {
                await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                    lastAdventure: Date.now(),
                    adventureStageOrder: profileData.adventureStageOrder.filter((_, i) => i !== profileData.adventureStageOrder.indexOf(randomStage))
                });
                profileData = await profileModel.findOne({ userID: message.author.id })
                const neutralMessage = new Discord.MessageEmbed()
                .setDescription(`${advFind.neutral[randomStage - advFind.stages.length]}\n\n - Nothing interesting happened`)
                .setFooter(get5StageString);
                message.reply({ embeds: [neutralMessage] })
                additionalInput.stopUser.delete(message.author.id);
            } else {
                const advStage = advFind.stages[randomStage];
                let advStageButtons = [];
                advStage.choices.forEach((e, index) => { 
                    advStageButtons.push(new Discord.MessageButton()
                    .setLabel(e.description)
                    .setCustomId(advId(index, e.description))
                    .setStyle('PRIMARY'));
                })

                var advMessage = {};
                advMessage.embeds = [new Discord.MessageEmbed().setDescription(advStage.description)];
                advMessage.components = [new Discord.MessageActionRow().addComponents(...advStageButtons)];

                const endAdventure = async (obj, loss) => {
                    await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                        adventure: [-1, false, undefined],
                        adventureBackpack: [],
                        adventureLoot: { coin: 0, items: [] },
                        adventureStageOrder: [],
                        lastAdventure: 0,
                    });
                    let endEmbed1 = new Discord.MessageEmbed()
                    .setColor('RANDOM')
                    .setFooter(get5StageString);

                    let description;
                    if (obj) { 
                        description = obj.description;
                        if (loss) { description += `\n\n - You lost all your items in your backpack, and your adventure has ended.` }
                        else { description += `\n\n - Your adventure has ended.` }
                        endEmbed1.setDescription(description);

                        advMessage.components[0].components.forEach(e => e.setDisabled(true));
                        advMessage.embeds = [endEmbed1];
                        await theMsg.edit(advMessage)
                    }

                    let backpackList = [];

                    if (!loss) {
                        for (var item of profileData.adventureBackpack) { await addItem.execute(message.author, profileData, item.name, 1, profileModel); }
                        for (var item of profileData.adventureLoot.items) { await addItem.execute(message.author, profileData, item.name, item.amount, profileModel); backpackList.push(item.name) }
                        await addMoney.execute(message.author, profileData, profileData.adventureLoot.coin, profileModel);
                    }

                    let backpackItemsEmoji = (await getDataItems(backpackList)).join(' ');

                    const endEmbed2 = new Discord.MessageEmbed()
                    .setTitle('Your adventure has ended!')
                    .addFields(
                        { name: 'Coins earned:', value: `⏣ ${!!loss ? 0 : profileData.adventureLoot.coin.toLocaleString()}`, inline: true },
                        { name: 'Items obtained:', value: `${!backpackList.length ? 'No items obtained.' : backpackItemsEmoji}` }
                    )
                    
                    message.reply({ embeds: [endEmbed2] });

                    additionalInput.stopUser.delete(message.author.id);
                }

                if (!profileData.adventureStageOrder.filter(e => e < advFind.stages.length).length) await endAdventure(undefined, false);
                else {
                    var theMsg = await message.reply(advMessage);
                    var done = false;

                    const collectFunc = async (collector, interaction) => {
                        await interaction.deferUpdate();

                        await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                            lastAdventure: Date.now(),
                            adventureStageOrder: profileData.adventureStageOrder.filter((_, i) => i !== profileData.adventureStageOrder.indexOf(randomStage))
                        });
                        profileData = await profileModel.findOne({ userID: message.author.id })

                        const intDesc = interaction.customId.replace('_adventure', '').split('-')[0];
                        const foundAdvData = advStage.choices.find(e => e.description == intDesc);
                        if (!foundAdvData) throw new Error('Can\'t find the data, code has bugs?');

                        const chances = foundAdvData.chances.map(e => e.chance);
                        let cumulativeSum = chances.map((sum => value => sum += value)(0));
                        cumulativeSum.unshift(0);
                        let random = Math.random();
                        let advResult;
                        for (var i = 0; i < chances.length; i++) {
                            if (random >= cumulativeSum[i] && random <= cumulativeSum[i+1]) { advResult = foundAdvData.chances[i]; break; }
                        }
                        if (!advResult) throw new Error('The data chances don\'t add up to 1.');

                        let descriptionAdvResult = ``;

                        if (advResult.add) {
                            let multiBullets = ``;
                            if (advResult.add.type == 'coin') {
                                const itemsMulti = profileData.adventureBackpack.map(e => e.multi / 100).reduce((a, b) => a + b, 0)
                                descriptionAdvResult += `⏣ ${(advResult.add.amount * (1 + itemsMulti)).toLocaleString()}`;
                                await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                                    $inc: {
                                        'adventureLoot.coin': advResult.add.amount * (1 + itemsMulti),
                                    }
                                })
                                for (var item of profileData.adventureBackpack) {
                                    const backpackFoundItem = await findItem.execute(item.name);
                                    multiBullets += `\n - **${backpackFoundItem.itemname}** provided you with a **${item.multi}%** multi`
                                }
                            } else if (advResult.add.type == 'item') {
                                const foundItem = await findItem.execute(advResult.add.name);
                                descriptionAdvResult += `1 ${foundItem.itemname}`;
                                if (profileData.adventureLoot.items.find(e => e.name == advResult.add.name)) {
                                    await profileModel.findOneAndUpdate({ userID: message.author.id, 'adventureLoot.items.$.name': advResult.add.name }, {
                                        $inc: { 'adventureLoot.items.$.amount': 1 }
                                    })
                                } else await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                                    $push: { 'adventureLoot.items': { name: advResult.add.name, amount: 1 } }
                                })
                            }
                            const newEmbed = new Discord.MessageEmbed()
                            .setColor('GREEN')
                            .setDescription(`${advResult.description}\n\n - + ${descriptionAdvResult}${multiBullets}`)
                            .setFooter(get5StageString);
                            advMessage.components[0].components.forEach(e => e.setDisabled(true));
                            advMessage.embeds = [newEmbed];
                            await theMsg.edit(advMessage);
                        } else if (advResult.loss) {
                            let random2 = Math.random();
                            let choice;
                            if (random2 < advResult.loss[0]) { choice = 'item' } else if (random2 < advResult.loss[0] + advResult.loss[1]) { choice = 'death' } else { choice = 'nothing' }
                            if (choice == 'item' && profileData.adventureBackpack.length) {
                                let randomItem = profileData.adventureBackpack[Math.floor(Math.random() * profileData.adventureBackpack.length)];
                                let randomItemFound = await findItem.execute(randomItem.name);

                                const newEmbed = new Discord.MessageEmbed()
                                .setColor('RED')
                                .setDescription(`${advResult.description}\n\n - You lost your **${randomItemFound.itemname}**`)
                                .setFooter(get5StageString);
                                advMessage.components[0].components.forEach(e => e.setDisabled(true));
                                advMessage.embeds = [newEmbed];
                                await theMsg.edit(advMessage);
                                await profileModel.findOneAndUpdate({ userID: message.author.id }, { $pull: { adventureBackpack: randomItem } });
                            }
                            else if (choice == 'death') await endAdventure(advResult, true);
                            else {
                                const nothingEmbed = new Discord.MessageEmbed()
                                .setColor('BLACK')
                                .setDescription(`${advResult.description}\n\n - Nothing interesting happened`)
                                .setFooter(get5StageString);
                                advMessage.components[0].components.forEach(e => e.setDisabled(true));
                                advMessage.embeds = [nothingEmbed];
                                await theMsg.edit(advMessage)
                            }
                        } else {
                            const nothingEmbed = new Discord.MessageEmbed()
                            .setColor('BLACK')
                            .setDescription(`${advResult.description}\n\n - Nothing interesting happened`)
                            .setFooter(get5StageString);
                            advMessage.components[0].components.forEach(e => e.setDisabled(true));
                            advMessage.embeds = [nothingEmbed];
                            await theMsg.edit(advMessage)
                        }

                        done = true;
                        additionalInput.stopUser.delete(message.author.id);
                        return collector.stop();
                    }

                    const endFunc = async (collector, interaction) => {
                        if (!done) {
                            advMessage.components[0].components.forEach(e => e.setDisabled(true));
                            await theMsg.edit(advMessage);
                            additionalInput.stopUser.delete(message.author.id);
                        }
                    }

                    await createButton.execute(Discord, client, message, message.author, 60, baseid, collectFunc, endFunc, theMsg)
                }
            }
        }
    },
};