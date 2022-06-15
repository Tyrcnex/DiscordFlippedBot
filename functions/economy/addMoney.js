const fs = require('fs')

module.exports = {
	functionName: 'addMoney',
	description: 'Adds money to a user\'s balance.',
	async execute(user, userData, amount, profileModel) {
        await profileModel.findOneAndUpdate({
            userID: user.id,
        }, {
            $inc: {
                coins: parseInt(amount)
            }
        })
	}
}