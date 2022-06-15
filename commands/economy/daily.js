const addMoney = require('../../functions/economy/addMoney.js')

module.exports = {
    name: "daily",
    aliases: ["24hr", "24hrs"],
    permissions: [],
    description: "This is the daily command. Here, you can claim your daily coins!",
    usage: `Type in \`{prefix} daily\``,
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		const dateNow = Date.now();
        const prevNowDate = [(Math.floor(dateNow/86400000)-1)*86400000, Math.floor(dateNow/86400000)*86400000, Math.ceil(dateNow/86400000)*86400000];
        let alreadyClaimed = false;
        let forgotStreak = false;
        if (profileData.lastDaily < prevNowDate[0] && profileData.lastDaily !== 0) forgotStreak = true;
        else if (profileData.lastDaily > prevNowDate[1]) alreadyClaimed = true;
        else if (profileData.lastDaily > prevNowDate[2]) console.log('daily is broken lol');

        const dailyCoins = (streak) => 25000 + 100 * streak;

        const messageObj = {};
        if (forgotStreak) { 
            messageObj.content = `Oof, you forgot to do your daily streak <t:${Math.floor(prevNowDate[1]/1000)}:R>.`;
            await profileModel.findOneAndUpdate({ userID: message.author.id }, { dailyStreak: 0 });
        }
        if (alreadyClaimed) messageObj.embeds = [new Discord.MessageEmbed()
            .setColor('BLACK')
            .setTitle('You\'ve already claimed your daily today...')
            .setDescription(`Your next daily is ready in <t:${Math.floor(prevNowDate[2]/1000)}:R>`)
        ];
        else { 
            messageObj.embeds = [new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle(`Here are your daily coins, ${message.author.username}.`)
                .setDescription(`⏣ ${dailyCoins(profileData.dailyStreak).toLocaleString()} was placed in your wallet!`)
                .setFooter(`${profileData.dailyStreak.toLocaleString()} daily streak (+⏣ ${(dailyCoins(profileData.dailyStreak) - 25000).toLocaleString()})`)
            ];
            await profileModel.findOneAndUpdate({ userID: message.author.id }, { lastDaily: dateNow, $inc: { dailyStreak: 1 } });
            await addMoney.execute(message.author, profileData, dailyCoins(profileData.dailyStreak), profileModel);
        }

        message.channel.send(messageObj);
    },
};