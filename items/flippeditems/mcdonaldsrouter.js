const detectMention = require(`${process.cwd()}/functions/discord/detectMention.js`)
const addMoney = require(`${process.cwd()}/functions/economy/addMoney.js`)

module.exports = {
    name: 'mcdonaldsrouter',
    itemname: 'McDonald\'s Router',
    aliases: ['mcdonalds router', 'macrouter'],
    emoji: '<:McDonaldsRouter:976651867272646707>',
    cooldown: 3600,
    net: 100000000,
    sell: 20000000,
    description: 'Give someone McDonald\'s wifi. I promise, it\'s super quick!',
    multiUse: false,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        additionalInput.stopUser.set(message.author.id);
        const filter = m => m.author.id === user.id
        const collector = message.channel.createMessageCollector({ filter, time: 15000 });
        message.channel.send('Enter a user into the chat!')
        let done = false;
        changes.loss = true;

        collector.on('collect', async e => {
            let detectedMention = await detectMention.execute(e, client);
            if (detectedMention) { 
                if (detectedMention.id === user.id) { message.reply('lol why are you trying to give yourself mcdonalds wifi'); changes.stopCooldown = true; await addItem.execute(user, userData, 'mcdonaldsrouter', 1, profileModel) }
                else {
                    let findModel = await profileModel.findOne({ userID: detectedMention.id });
                    if (!findModel) { message.reply('That user hasnt used this bot before, what a loser'); changes.stopCooldown = true; await addItem.execute(user, userData, 'mcdonaldsrouter', 1, profileModel) }
                    else {
                        if (findModel.debuffs.map(e => e.name === 'cooldown').length) { message.reply('This user already has a cooldown debuff, let\'s not bully him lol'); changes.stopCooldown = true; await addItem.execute(user, userData, 'mcdonaldsrouter', 1, profileModel) }
                        else {
                            await profileModel.findOneAndUpdate({ userID: detectedMention.id }, {
                                $push: { debuffs: { name: 'cooldown', deactivate: Date.now() + 3600000, value: 2 } }
                            });
                            message.channel.send(`You gave ${detectedMention.username} McDonald\'s wifi for one hour, zbzbzbzbzzzzbzz`);
                        }
                    }
                }
            } else { message.reply('Invalid user'); changes.stopCooldown = true; await addItem.execute(user, userData, 'mcdonaldsrouter', 1, profileModel) }
            done = true;
            collector.stop();
        });

        collector.on('end', async collected => {
            if (!done) { message.channel.send('I guess you didn\'t want to use the item??'); changes.stopCooldown = true; return await addItem.execute(user, userData, 'mcdonaldsrouter', 1, profileModel) }
            additionalInput.stopUser.delete(message.author.id);
        })
    }
}