const addMoney = require('../../functions/economy/addMoney.js');
const { failMsg, normalMsg, chance } = require('../../jsData/begData.js')

module.exports = {
    name: "beg",
    aliases: [],
    permissions: [],
    cooldown: 20,
    cooldownMsg: "If you could beg for money every second of your life, you'd be rich by now! Unfortunately, that's not how we roll, so",
    description: "Beg for coins.",
    usage: "Type in \`{prefix} beg\`",
    isGrind: true,
    xpAdd: 1,
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
        let randomCoin = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;

        var newRandomCoin = Math.floor(randomCoin * (1 + profileData.multi / 100))

        if (Math.random() < chance) {
            await addMoney.execute(message.author, profileData, newRandomCoin, profileModel);
        } else {
            randomCoin = 0;
        }

        const begEmbed = new Discord.MessageEmbed()
        .setColor(randomCoin === 0 ? 'RED' : 'GREEN')
        .addFields(
            {
                name: randomCoin === 0 ? failMsg[Math.floor(Math.random() * failMsg.length)] : normalMsg[Math.floor(Math.random() * normalMsg.length)],
                value: randomCoin === 0 ? 'You didn\'t get any coins! Sad.' : `Wow! You begged and received **⏣ ${newRandomCoin.toLocaleString()}**!`
            }
        )
        .setFooter(randomCoin === 0 ? 'imagine being so bad' : `Multi bonus: +${profileData.multi}% (⏣ ${(newRandomCoin - randomCoin).toLocaleString()})`)

        message.channel.send({ embeds: [begEmbed] });
    },
  };