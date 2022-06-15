module.exports = {
    name: "emoji",
    permissions: [],
    aliases: [],
    description: "Gets the emojis",
    usage: 'Type in \`{prefix} emoji\`',
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        const emojiGuild = await client.guilds.cache.get('969096692588773426');
        const emojis = emojiGuild.emojis.cache
        .map(e => `${e} **-** \`<${e.animated ? 'a' : ''}:${e.name}:${e.id}>\``);
        let emojiSplit = [];
        const chunkSize = 20;
        for (let i = 0; i < emojis.length; i += chunkSize) {
            const chunk = emojis.slice(i, i + chunkSize);
            emojiSplit.push(chunk.join('\n'));
        }
        
        for (let emoji of emojiSplit) { message.channel.send({ content: emoji }); }
    }
}