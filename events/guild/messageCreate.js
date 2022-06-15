require('dotenv').config();

const cooldowns = new Map();
const itemCooldowns = new Map();

const stopUser = new Map();
const fs = require('fs');

const addItem = require('../../functions/economy/addItem.js');
const addMoney = require('../../functions/economy/addMoney.js');
const findItem = require('../../functions/economy/findItem.js');

const profileSchemaModel = require("../../models/profileSchema");
const profileSchema = new profileSchemaModel();
const profileModel = profileSchema.getSchema().profileModel;
const defaultObj = profileSchema.getSchema().defaultObj;
const schemaObj = profileSchema.getSchema().schemaObj;

module.exports = async (Discord, client, message) => {
    let mode = process.argv[2] || 'debug';

    let testers = [
        '801715615424315432', // Tyrcnex
        '753103624686665848', // DarkNova
        '870060633524150322', // Angry Bee
        '543929221165088779', // D4RKN355
        '815835443908050977', // IanJames426
        '819808840366555176', // Zohnthejohn
        '751307088889774182', // Drone
        '533409381887377428', // A Canadian Goose
    ];

    let botManagers = [
        '801715615424315432', // Tyrcnex
        '815835443908050977', // IanJames426
    ]

    let admins = [
        '801715615424315432', // Tyrcnex
    ];

    //Bot and self-message checking
    if (message.author.bot) return;

    //Prefix
	const prefixSpace = process.env.PREFIXSPACE == 'TRUE' ? " " : "";
    const prefix = process.env.PREFIX.toLowerCase() + prefixSpace;
    if (!message.content.toLowerCase().startsWith(prefix)) return;
    if (stopUser.has(message.author.id)) return;

    //Database handling
    let daObj = defaultObj;
    daObj.userID = message.author.id;
    daObj.username = message.author.tag;

    let profileData;
    try {
        profileData = await profileModel.findOne({ userID: message.author.id });
        if (!profileData) {
            profileData = await profileModel.create(daObj);
        }
    } catch (err) {

    }

    for (const porperty in daObj) {
        try {
            if (!profileData[porperty]) {
                profileData.set(porperty, daObj[porperty], {strict: false});
            }

            if (!profileData.userID) {
                profileData.set('userID', message.author.id, {strict: false})
            } else if (profileData.username !== message.author.tag) {
                profileData.set('username', message.author.tag, {strict: false})
            }
        } catch (err) {
            return message.reply('Hi there! You\'re a new user, aren\'t you? Could you kindly run the command again, please?');
        }
    }

    for (key of Object.keys(profileData._doc)) {
        if (daObj[key] == undefined) {
            if (key != '_id' && key != '_v') {
                profileData.set(key, undefined, {strict: false});
            }
        }
    }

    profileData.save();
	profileData = await profileModel.findOne({ userID: message.author.id });

    //Argument and command setups

    const args = message.content.slice(prefix.length).split(/ +/)
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find((a) => a.aliases && a.aliases.includes(cmd));
    if (!command) return message.reply(`Try again, but this time actually try to use a valid command.`)
    if (command.wip && !(admins.includes(message.author.id) || botManagers.includes(message.author.id))) return message.reply(`Hiya, so the devs aren\'t done with the WIP command \`${command.name}\` yet, so you\'ll have to wait.`)

    //Permissions

    const validPermissions = [
        "CREATE_INSTANT_INVITE",
        "KICK_MEMBERS",
        "BAN_MEMBERS",
        "ADMINISTRATOR",
        "MANAGE_CHANNELS",
        "MANAGE_GUILD",
        "ADD_REACTIONS",
        "VIEW_AUDIT_LOG",
        "PRIORITY_SPEAKER",
        "STREAM",
        "VIEW_CHANNEL",
        "SEND_MESSAGES",
        "SEND_TTS_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "VIEW_GUILD_INSIGHTS",
        "CONNECT",
        "SPEAK",
        "MUTE_MEMBERS",
        "DEAFEN_MEMBERS",
        "MOVE_MEMBERS",
        "USE_VAD",
        "CHANGE_NICKNAME",
        "MANAGE_NICKNAMES",
        "MANAGE_ROLES",
        "MANAGE_WEBHOOKS",
        "MANAGE_EMOJIS",
    ]
        
        
    try{
        if(command.permissions.length){
            let invalidPerms = []
            for(const perm of command.permissions){
                if(!validPermissions.includes(perm)){
                    return console.log(`Invalid Permissions ${perm}`);
                }
                if(!message.member.hasPermission(perm)){
                    invalidPerms.push(perm);
                }
            }
                if (invalidPerms.length){
                    return message.channel.send(`You're missing some permissions! The following permissions are required, and you don't have them: \n\n\`\`\`${invalidPerms}\`\`\``);
                }
        }
    } catch (err){
        
    }

    //Cooldowns

    if(!!command && !cooldowns.has(command.name)){
        cooldowns.set(command.name, new Discord.Collection());
    }

    var cooldownStrings = [
        "Stop spamming",
        "Spam isn't good for you",
        "You spammer",
        "Spam isn't cool fam",
        "Spammer stop spamming",
        "Spammer, begone thot",
    ];

    const current_time = Date.now();
    const time_stamps = cooldowns.get(command.name);
    const cooldown_amount = (command.cooldown) * 1000;
    let cooldownDebuff = profileData.debuffs.filter(e => e.name === 'cooldown').map(e => e.value).reduce((a,b) => a+b, 0)
    if (cooldownDebuff === 0) cooldownDebuff = 1;

    if(time_stamps.has(message.author.id)){
        const expiration_time = time_stamps.get(message.author.id) + (cooldown_amount / 3) * cooldownDebuff;

        if(current_time < expiration_time){
            const time_left = (expiration_time - current_time) / 1000;
            const commandThing = command.cooldownMsg || "You can run this command again later";
            const cooldownEmbed = new Discord.MessageEmbed()
            .setColor('#e83333')
            .addFields(
                {name: cooldownStrings[Math.floor(Math.random() * cooldownStrings.length)], value: `${commandThing}, wait **${Math.ceil(time_left)}** more seconds before using \`${command.name}\` again! The default cooldown is \`${command.cooldown}s\`, but the bot is in beta and you get a cooldown reduction of 3x!.${cooldownDebuff > 1 ? ` (You are affected by a cooldown debuff of **${cooldownDebuff}x**)` : ''}`}
            );
            
            return message.reply({embeds: [cooldownEmbed] });
        }
    }

    class cancelCooldown {
        constructor (cooldown) { this.cooldown = cooldown }
		cancel() { this.cooldown = false }
    }

    var cooldownCheck = new cancelCooldown(true);

    //Multi

    var multiList = require('../../jsData/multiList.js');
    var multi = 0;
    for await (var multiVal of multiList) {
        multi += await multiVal.value(profileData);
    }

    var multiObj = [];
    for await (var multiVal of multiList) {
        let value = await multiVal.value(profileData);
        if (value > 0) { 
            let { value, ...removedFunction } = multiVal;
            multiObj.push(removedFunction);
        }
    }
    await profileModel.findOneAndUpdate(
        { userID: message.author.id },
        { multi: multi, multiObj: multiObj }
    )

    //Active items
    for (var item of profileData.activeItems) { if (Date.now() > item.deactivate) await profileModel.findOneAndUpdate({ userID: message.author.id }, { $pull: { activeItems: item } }) }

    //Debuff
    for (var debuff of profileData.debuffs) { if (Date.now() > debuff.deactivate) await profileModel.findOneAndUpdate({ userID: message.author.id }, { $pull: { debuffs: debuff } }) }

    const additionalInput = {
        bankspaceXP: (userData) => userData.bankspace + Math.floor((typeof userData.xp !== undefined ? userData.xp : 0) * 0.5),
        net: async (userData) => {
            let net = userData.coins + userData.bank;
            for (let item of userData.items) {
                let userDataFoundItem = await findItem.execute(item.name);
                let itemNet = 0;
                if (userDataFoundItem.net) itemNet += userDataFoundItem.net;
                else if (userDataFoundItem.price) itemNet += userDataFoundItem.price;
                else if (userDataFoundItem.sell) itemNet += userDataFoundItem.sell;
                net += itemNet * item.amount;
            } return net;
        },
        level: Math.floor(profileData.xp / 100),
        stopUser: stopUser,
        roles: {
            testers: testers,
            admins: admins,
            botManagers: botManagers,
        },
        itemCooldowns: itemCooldowns
    }

    const levelRewards = require('../../jsData/levelRewards.js');
    if (profileData.lastXP !== profileData.xp) await profileModel.findOneAndUpdate({ userID: message.author.id }, { lastXP: profileData.xp });
    if (Math.floor(profileData.lastXP / 100) < additionalInput.level) {
        var sendString = `Congratulations *${message.author.username}*, you just leveled up! You are now **Level ${additionalInput.level}**`;
        if (levelRewards.map(e => e.level).includes(additionalInput.level)) {
            var levelReward = levelRewards.find(e => e.level === additionalInput.level);
            sendString += `${!!levelReward.description ? levelReward.description + ' ' : '! '}You also found `
            var rewardList = levelReward.reward.sort((a,b) => b.type - a.type);
            for (var reward of rewardList) {
                if (reward.type === 'item') { await addItem.execute(message.author, profileData, reward.name, reward.amount, profileModel); sendString += `${reward.amount.toLocaleString()} ${(await findItem.execute(reward.name)).itemname}${rewardList.map(e => e.type === 'item').length === 1 ? ' ' : ', '}`}
                if (reward.type === 'coin') { await addMoney.execute(message.author, profileData, reward.amount, profileModel); sendString += `${rewardList.length === 1 ? '' : 'and '}⏣ ${reward.amount.toLocaleString()}`};
            }
            sendString += '!'
        }
        message.channel.send(sendString);
    }

    //Message Events
    const messageFiles = fs.readdirSync(`./messageEvents/`).filter(file => file.endsWith('.js'));
    
    for (const file of messageFiles) {
        const messageFile = require(`../messageEvents/${file}`);
        try{
            messageFile.execute(client, message, cmd, args, Discord, profileModel, profileData);
        } catch (err){
            message.reply("There was an error running an event! Contact Tyrcnex#9403 to address the issue.");
            console.log(err);
        }
    }

    profileData = await profileModel.findOne({ userID: message.author.id });
    
    try{
        await command.execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput);
        if (mode === 'debug') console.log(`User ${message.author.username} ran the command ${command.name}!`)
    } catch (err){
        message.reply(`There was an error trying to execute this command!\n\nError log:\`\`\`${err}\`\`\``);
        console.log(err);
		cooldownCheck.cancel();
    }

    if (cooldownCheck.cooldown === true) { 
        if (!testers.includes(message.author.id) && !admins.includes(message.author.id)) {
            time_stamps.set(message.author.id, current_time);
            setTimeout(() => time_stamps.delete(message.author.id), (cooldown_amount / 3) * cooldownDebuff);
        }
        if (command.isGrind && command.xpAdd) { 
            var grind = command.xpAdd;
            var xpMulti = profileData.activeItems.map(e => e.changes.filter(x => x.name === 'xpadd').map(x => x.value).reduce((a,b) => a+b, 0)).reduce((a,b) => a+b,0);
            await profileModel.findOneAndUpdate(
                { userID: message.author.id },
                { $inc: { xp: grind * (xpMulti === 0 ? 1 : xpMulti) } }
            )
        }
	}
}