const fs = require('fs')
const getItems = require('./getItems.js');
const findItem = require('./findItem.js');

module.exports = {
	functionName: 'addItem',
	description: 'Adds item(s) to a user\'s inventory.',
	async execute(user, userData, item, amount, profileModel) {
        let validItem = await findItem.execute(item);
        if (!validItem) throw new Error('Invalid item.');
        validItem = { name: validItem.name };

		const userHasItem = userData.items.some(e => e.name == item);
		if (userHasItem === true) {
			await profileModel.findOneAndUpdate({
				userID: user.id, "items.name": item
			}, {
				$inc: {
					"items.$.amount": parseInt(amount)
				}
			})
		} else {
            let amountObj = validItem;
            amountObj.amount = parseInt(amount);
			await profileModel.findOneAndUpdate({
				userID: user.id
			}, {
				$push: {
					items: amountObj
				}
			})
		}
	}
}