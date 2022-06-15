module.exports = (Discord, client, message) => {
    console.log('\x1b[32m', '|___________________________________|\n |                                   |\n |          Flip is online!          |\n |                                   |\n |___________________________________|', '\x1b[0m');
	setInterval(() => {
        client.channels.fetch('973521726774321162').then(e => e.messages.fetch('973533645786734593').then(msg => { try { msg.edit(`Bot is online! <t:${Math.floor(Date.now()/1000)}:R>`); } catch (err) {console.log(err)} })).catch(err => {})
	}, 5000)
}