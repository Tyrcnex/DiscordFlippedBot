const fs = require('fs')

module.exports = {
	functionName: 'detectMention',
	description: 'Detects a mention.',
	async execute(message, client, args) {
        let mentionUser = message.mentions.users.first();
        if (!mentionUser) {
            var guild = await client.guilds.cache.get(message.guildId);
            if (args) {
                for (var argument of args) {
                    try { var theGuildMember = await guild.members.fetch(argument) } catch (err) { var theGuildMember = undefined; }
                    if(!!theGuildMember) { mentionUser = theGuildMember; break; }
                }
            } else {
                for (var argument of message.content.split(/ +/)) {
                    try { var theGuildMember = await guild.members.fetch(argument) } catch (err) { var theGuildMember = undefined; }
                    if(!!theGuildMember) { mentionUser = theGuildMember; break; }
                }
            }
            if (!mentionUser) {
                if (args) args = args.filter(e => e.includes('#'))
                else var args = message.content.split(/ +/).filter(e => e.includes('#'))

                if (!args.length) return;
                var cacheUsers = await args.find(a => client.users.cache.find(u => u.tag === a));
                if (cacheUsers) return await client.users.cache.find(u => u.tag === cacheUsers)
                return cacheUsers;
            } else return mentionUser.user;
        } else return mentionUser;
	}
}