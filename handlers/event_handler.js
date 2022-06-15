const fs = require('fs');
const path = require('path')

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

    getFilesRecursively(`./events`);

    for (const file of files) {
        if (file.includes('.DS_Store')) continue;
        const event = require(`${process.cwd()}/${file}`);
        const foldersAndFiles = file.split('/')
        const event_name = foldersAndFiles[foldersAndFiles.length - 1].split('.')[0]
        client.on(event_name, event.bind(null, Discord, client));
    }
}