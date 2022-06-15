var createButton = require(`${process.cwd()}/functions/discord/createButton.js`);
var addMoney = require(`../../functions/economy/addMoney.js`)

module.exports = {
    name: "work",
    permissions: [],
    aliases: ['wrk'],
    description: "Work to get money!",
    usage: 'Type in \`{prefix} work\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        let workData = require(`${process.cwd()}/jsData/workData.js`);

        let workShow = async () => {
			profileData = await profileModel.findOne({ userID: message.author.id })
            if (Date.now() - profileData.lastWork <= 3600000 && profileData.lastWork - Date.now() < 1000000000000) return message.reply({ embeds: [new Discord.MessageEmbed().setColor('BLACK').setDescription(`You can work again <t:${Math.floor(profileData.lastWork/1000 + 3600)}:R>`)] });
            await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                $inc: {
                    timesWorkedToday: 1,
                },
                $set: {
                    lastWork: Date.now(),
                }
            });
            let job = workData.find(e => e.name === profileData.job);
            let modes = 1;
            let randMode = Math.ceil(Math.random()*modes);
            switch (randMode) {
                case 1: { // Guess the order!
                    let listOfWords = job.words.sort(() => .5 - Math.random()).slice(0,5);
                    let theMsg = await message.reply(`**Memorize the words in their order!**\n\n${listOfWords.map(e => `\`${e}\`\n`).join('')}`);
                    const makeWordButtons = async () => {
                        let id = (index) => `workmain-${message.author.id}-${Date.now()}-${index}`
                        let baseid = id(1).slice(0,-2);
                        let firstbuttons = [];
                        for (let word of listOfWords) {
                            firstbuttons.push(
                                new Discord.MessageButton()
                                .setLabel(word)
                                .setStyle('SECONDARY')
                                .setCustomId(id(word))
                            );
                        }
						let buttons = firstbuttons;
						
                        buttons = buttons.sort(() => .5 - Math.random()).slice(0,5);
                        let row = new Discord.MessageActionRow().addComponents(buttons)
                        await theMsg.edit({ content: `Press the buttons in the order that you memorized!`, components: [row] });
                        let fail = false;
                        let done = false;

                        var collectFunc = async (collector, interaction) => {
                            await interaction.deferUpdate();

                            let firstWord = listOfWords[0];
                            if (interaction.customId.split('-')[3] === firstWord) { 
                                row.components.map(e => { if (e.label === firstWord) e.setDisabled() })
                                listOfWords.shift();
                            }
                            else { 
                                fail = true;
                                collector.stop();
                            };
                            if (!listOfWords.length) { done = true; return collector.stop(); } // End
                            return await theMsg.edit({ content: `Press the buttons in the order that you memorized!`, components: [row] });
                        }
        
                        var endFunc = async (collector, interaction) => {
        
                            row.components.forEach(int => int.setDisabled());
                            
                            if (fail || !done) {
                                await profileModel.findOneAndUpdate({ userID: message.author.id }, { $inc: { workFailsToday: 1 } });
                                await addMoney.execute(message.author, profileData, job.base / 4, profileModel);
                                let failEmbed = new Discord.MessageEmbed()
                                .setDescription(`${fail ? 'You clicked a wrong button' : 'You didn\'t click in time'}, so you got a job fail, sed :( You only got ⏣ ${(job.base/4).toLocaleString()}.`)
                                .setFooter(`imagine not succeeding at work lol`);
                                return message.channel.send({ embeds: [failEmbed] });
                            } else {
                                await addMoney.execute(message.author, profileData, job.base, profileModel);
                                let successEmbed = new Discord.MessageEmbed()
                                .setDescription(`Your boss was satisfied and you got ⏣ ${(job.base).toLocaleString()}`)
                                .setFooter(`work success 👍🏻`);
                                return message.channel.send({ embeds: [successEmbed] });
                            }
        
                        }
        
                        await createButton.execute(Discord, client, message, message.author, 8, baseid, collectFunc, endFunc, theMsg)
                    }
                    setTimeout(makeWordButtons, 4000);
                }
            }
        }

        if (args.length) {
            if (args[0] === 'resign') {
                if (profileData.job.length) {
                    await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                        $set: {
                            job: '',
                            timesWorkedToday: 0,
                            workFailsToday: 0,
                            lastWork: 0,
                            resign: Date.now()
                        }
                    });
                    return message.reply(`You resigned, so you need to work 3 hours till you get another job!`)
                } else return message.reply(`You don\'t have a job, so why do you want to resign from your nonexistent job lol`);
            } else if (!!(workData.find(e => e.name === args.join(' ').toLowerCase()) || workData.find(e => e.aliases.includes(args.join(' ').toLowerCase())))) {
                if (profileData.job.length) {
                    let job = workData.find(e => e.name === profileData.job);
                    message.reply(`You are already working as a **${job.displayname}**!`);
                    return cooldownCheck.cancel();
                } else {
                    if (profileData.resign && profileData.resign + 10800000 > Date.now() ) return message.reply(`You\'ve resigned your job recently, you can get another job in <t:${Math.floor(profileData.resign/1000 + 10800)}:R>`);
                    else if (profileData.lostJob && profileData.lostJob + 21600000 > Date.now()) return message.reply(`You\'ve lost your job recently, you can get another job in <t:${Math.floor(profileData.lostJob/1000 + 21600)}:R>`);
                    let job = workData.find(e => e.name === args.join(' ').toLowerCase()) || workData.find(e => e.aliases.includes(args.join(' ').toLowerCase()))
                    await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                        $set: {
                            job: job.name,
                            timesWorkedToday: 0,
                            workFailsToday: 0,
                            lastWork: 1,
                        }
                    });
                    message.reply(`Congratulations, you are now working as a **${job.displayname}**! You are required to work ${job.days} hours a day, or else you\'ll get fired!`);
                    await profileModel.findOneAndUpdate({ userID: message.author.id }, { $set: { lastWork: 32500915200000 }});
                    return;
                }
            }
        }

        if (!profileData.lastWork) { // No job
            var page = 1;
            var perPage = 5;
            var allowedPages = Math.ceil((workData.length - 0.5)/ perPage);
            var newWorkNames = workData.slice(perPage * (page - 1), perPage * page);

            let workDescription = ``;
            for (const workName of newWorkNames) { workDescription += `**${workName.displayname}** — *${workName.description}*\nPay: ⏣ ${workName.base.toLocaleString()}\nDays of work required: ${workName.days.toLocaleString()}\n\n` }

            var workEmbed = new Discord.MessageEmbed()
            .setColor('PURPLE')
            .setTitle(`Available jobs`)
            .setDescription(workDescription);

            let id = (index) => `workpage-${message.author.id}-${Date.now()}-${index}`
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

            let messageObj = { embeds: [workEmbed] };
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

                    var newWorkNames = workData.slice(perPage * (page - 1), perPage * page);
                    workDescription = ``;
                    for (const workName of newWorkNames) { workDescription += `**${workName.displayname}** — *${workName.description}*\nPay: ⏣ ${workName.base.toLocaleString()}\nDays of work required: ${workName.days.toLocaleString()}\n\n` }

                    workEmbed = new Discord.MessageEmbed()
                    .setColor('PURPLE')
                    .setTitle(`Avaiable jobs`)
                    .setDescription(workDescription);

                    return await theMsg.edit({ embeds: [workEmbed], components: [row] });
                }

                var endFunc = async (collector, interaction) => {

                    row.components.forEach(int => int.setDisabled());
                    return await theMsg.edit({ embeds: [workEmbed], components: [row] });

                }

                await createButton.execute(Discord, client, message, message.author, 15, baseid, collectFunc, endFunc, theMsg)
            }
        } else if ( Math.floor(profileData.lastWork/(1000*60*60*24)) < Math.floor(Date.now()/(1000*60*60*24))) { // Next day
            let job = workData.find(e => e.name === profileData.job);
            if (profileData.timesWorkedToday - profileData.workFailsToday < job.days) { // Didn't do enough work hours
                await profileModel.findOneAndUpdate({ userID: message.author.id }, {
                    $set: {
                        job: '',
                        timesWorkedToday: 0,
                        workFailsToday: 0,
                        lastWork: 0,
                        lostJob: Date.now()
                    }
                });
                message.reply(`You didn\'t work enough hours (or succeeded enough), so you were fired from your job as a **${job.displayname}**.`);
            } else { 
                await profileModel.findOneAndUpdate({ userID: message.author.id }, { $set: { timesWorkedToday: 0, workFailsToday: 0 } });
                await workShow();
            }
        } else await workShow();
    }
}