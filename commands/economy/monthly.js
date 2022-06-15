const addMoney = require('../../functions/economy/addMoney.js')

module.exports = {
    name: "monthly",
    aliases: [],
    permissions: [],
    description: "This is the monthly command. Here, you can claim your monthly coins!",
    usage: `Type in \`{prefix} monthly\``,
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		const dateNow = new Date();
        let alreadyClaimed = false;
        function getMsToNextMonth(){
            var now = new Date();
            var nextMonth = (now.getMonth()+1)%12;
            var nextYear = now.getFullYear() + (nextMonth == 0);
            var then = new Date(nextYear,nextMonth,1);
            return then.getTime()/1000-(now.getTimezoneOffset()*60);
        }
        if (12*(profileData.lastMonthly[1]-(new Date()).getUTCFullYear()) + (new Date()).getUTCMonth()-profileData.lastMonthly[0] === 0) alreadyClaimed = true;

        const money = 1000000;

        const messageObj = {};
        if (alreadyClaimed) messageObj.embeds = [new Discord.MessageEmbed()
            .setColor('BLACK')
            .setTitle('You\'ve already claimed your monthly...')
            .setDescription(`Your next monthly is ready <t:${getMsToNextMonth()}:R>`)
        ]
        else { 
            messageObj.embeds = [new Discord.MessageEmbed()
                .setColor('GREEN')
                .setTitle(`Here are your monthly coins, ${message.author.username}.`)
                .setDescription(`⏣ ${money.toLocaleString()} was placed in your wallet!`)
            ];
            await profileModel.findOneAndUpdate({ userID: message.author.id }, { lastMonthly: [dateNow.getUTCMonth(), dateNow.getUTCFullYear()] });
            await addMoney.execute(message.author, profileData, money, profileModel);
        }

        message.channel.send(messageObj);
    },
};