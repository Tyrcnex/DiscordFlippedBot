const fs = require('fs');
const path = require('path')

module.exports = {
    functionName: 'getItems',
    description: 'Gets all the items in the items folder.',
    async execute() {
        let files = [];
        let item_list = [];

        const getFilesRecursively = (directory) => {
            const filesInDirectory = fs.readdirSync(directory);
            for (const file of filesInDirectory) {
                const absolute = path.join(directory, file);
                if (fs.statSync(absolute).isDirectory()) getFilesRecursively(absolute);
                else files.push(absolute);
            }
        };

        getFilesRecursively(`./items`);

        for (const file of files) {
            if (file.includes('.DS_Store')) continue;
            const itemFile = require(`${process.cwd()}/${file}`);
            item_list.push(itemFile);
        }

        return item_list;
    }
}