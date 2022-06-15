const getItems = require('./getItems.js')

module.exports = {
	functionName: 'findItem',
	description: 'Finds an item in the items folder.',
	async execute(item) {
        const item_list = await getItems.execute();

        return (item_list.find(e => e.name.toLowerCase() === item.toLowerCase()) || item_list.find(a => a.aliases && a.aliases.includes(item.toLowerCase())));
	}
}