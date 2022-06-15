const fs = require('fs')

module.exports = {
	functionName: 'createButton',
	description: 'Adds a button.',
	async execute(Discord, client, message, user, time, baseid, collectFunc, endFunc, theMsg, inputFilter) {
        var filter = async interaction => { 
            if (!inputFilter) {
                if (interaction.user.id === user.id) return true;
                return await interaction.reply({ content: 'This is not for you.', ephemeral: true })
            }
            else inputFilter;
        }

        const collector = theMsg.createMessageComponentCollector({
            filter,
            componentType: 'BUTTON',
            idle: parseInt(time) * 1000,
        });

        collector.on('collect', async interaction => {
            try { await collectFunc(collector, interaction); } catch (err) { console.log(err) };
        })

        collector.on('end', async interaction => {
            try { await endFunc(collector, interaction); } catch (err) { console.log(err) };
        });
	}
}