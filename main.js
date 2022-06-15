const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

const intents = new Intents(32767);
const client = new Client({
    intents: intents,
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false,
    }
});
 
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client, Discord);
})

mongoose.connect(process.env.MONGODB_SRV, err => {
    if (err) throw(err);
    console.log('\x1b[33m', "_____________________________________\n |                                   |\n |     Connected to the database!    |\n |                                   |\n |___________________________________|", '\x1b[0m');
});

client.login(process.env.DISCORD_TOKEN);