const findItem = require('./findItem.js');

module.exports = {
	functionName: 'findItem',
	description: 'Finds an item in the items folder.',
	async execute(userData, item) {
        const newItem = await findItem.execute(item);
        return userData.items.find(e => e.name.toLowerCase() == newItem.name);
	}
}