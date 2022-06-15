const fs = require('fs');
const path = require('path');

module.exports = {
    name: "help",
    aliases: ["hlp", 'commands', 'cmds'],
    permissions: [],
    description: "Shows the help command",
    usage: "Type in \`{prefix} help\`, the rest of the instructions are there in the command",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput){
        function flatten(lists) {
            return lists.reduce((a, b) => a.concat(b), []);
        }

        function getDirectories(srcpath) {
            return fs.readdirSync(srcpath)
                .map(file => path.join(srcpath, file))
                .filter(path => fs.statSync(path).isDirectory());
        }

        function getDirectoriesRecursive(srcpath) {
            return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
        }

        let pather = getDirectoriesRecursive('./commands');
        pather.shift();
        let pather2 = [];

        for(const element of pather) {
            let thing = element.split('/');
            let daThing = thing[thing.length - 1];
            pather2.push(daThing);
        }

        if (!args.length) {

            const firstHelpEmbed = new Discord.MessageEmbed()
            .setColor('BLACK')
            .setTitle('THIS IS WHERE YOU CAN GET HELP!')
            .addFields(
                {name: 'HELP', value: 'To get help in a category, type in \`{prefix} help [category]\`\nTo get help in a command, type in \`{prefix} help [command name, aliases allowed]\`\n---\n\n---'},
                {name: 'CATEGORIES:', value: `  -  \`${pather2.join("\`\n\  -  `")}\``},
            )

            message.channel.send({ embeds: [firstHelpEmbed] });
        } else if (args[0] && !args[1]) {
            let validArgs = false;
            let args0 = args[0].toLowerCase();

            const commandEmbed = [];

                const load_dir = (dirs) =>{
                    const command_files = fs.readdirSync(`./commands/${dirs}`).filter(file => file.endsWith('.js'));
                    
                    for (const file of command_files) {
                        const command = require(`../../commands/${dirs}/${file}`);
                        const embed = new Discord.MessageEmbed()
                        .setColor('BLACK')
                        .setTitle(`COMMAND - ${command.name.replace(/^./, command.name[0].toUpperCase())}`)
                        .addFields(
                            {name: 'Description:', value: command.description},
                            {name: 'Usage', value: command.usage},
                            {name: 'Aliases', value: command.aliases.length ? `  -  \`${command.aliases.join("\`\n\  -  `")}\`` : `No aliases`}
                        );

                        const obj = {
                            name: command.name,
                            command: command,
                            embed: embed,
                        }

                        commandEmbed.push(obj);
                    }
                }

                pather2.forEach(e => load_dir(e));

                for(const item in commandEmbed) {
                    if (commandEmbed[item].command.aliases.includes(args[0]) || args[0] == commandEmbed[item].name) {
                        let obj;
                        obj = commandEmbed[item];
                        
                        validArgs = true;
                        message.channel.send({ embeds: [obj.embed] });
                    } else continue;
                }

            for(const category of pather2) {
                const command_files = fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js'));
                var command_names = [];


                for (const file of command_files) {
                    const command = require(`../../commands/${category}/${file}`);
                    command_names.push(command.name);
                }

                const embed = new Discord.MessageEmbed()
                .setColor('BLACK')
                .setTitle(`CATEGORY - ${category.toUpperCase()}`)
                .addFields(
                    {name: 'COMMANDS:', value: (command_names.length !== 0 ? `  -  \`${command_names.join("\`\n\  -  `")}\`` : 'No commands in this category!')}
                );

                const obj = {
                    names: command_names,
                    embed: embed,
                }

                if (args0 == category) {
                    validArgs = true;
                    message.channel.send({embeds: [obj.embed] });
                }
            }

            if (validArgs == false) {
                message.channel.send({ content: 'Invalid category or command!'});
            }
        }
    }
}