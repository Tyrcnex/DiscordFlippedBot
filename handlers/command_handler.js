const fs = require('fs');
const path = require("path");

module.exports = (client, Discord) =>{
    let files = [];

    const getFilesRecursively = (directory) => {
        const filesInDirectory = fs.readdirSync(directory);
        for (const file of filesInDirectory) {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) getFilesRecursively(absolute);
            else files.push(absolute);
        }
    };

    getFilesRecursively(`./commands`);

    for (const file of files) {
        if (file.includes('.DS_Store')) continue;
        const command = require(`${process.cwd()}/${file}`);
        if(command.name) client.commands.set(command.name, command);
        else continue;
    }
}