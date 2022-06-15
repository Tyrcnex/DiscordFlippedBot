const fs = require('fs')

module.exports = {
	functionName: 'removeItem',
	description: 'Removes item(s) from a user\'s inventory.',
	async execute(user, userData, item, amount, profileModel) {
        const items = fs.readdirSync(`./items/`).filter(file => file.endsWith('.js'));
        const item_list = [];
        
        for (const item of items) {
            const itemFile = require(`${process.cwd()}/items/${item}`);
            item_list.push(itemFile);
        }

        const validItem = item_list.find(e => e.name.toLowerCase() == item.toLowerCase());
        if (!validItem) return new Error('Invalid item.');

		const userHasItem = userData.items.some(e => e.name == item);
        if (!userHasItem) return console.log(`This user (${user.username}) doesn\'t have this item!`)
        if (userData.items.find(e => e.name == item).amount - parseInt(amount) <= 0) {
            await profileModel.findOneAndUpdate({
                userID: user.id
            }, {
                $pull: {
                    "items": {
                        name: item
                    }
                }
            })
        } else {
            await profileModel.findOneAndUpdate({
                userID: user.id, "items.name": item
            }, {
                $inc: {
                    "items.$.amount": -parseInt(amount)
                }
            })
        }
	}
}