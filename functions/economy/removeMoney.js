const fs = require('fs')

module.exports = {
	functionName: 'removeMoney',
	description: 'Removes money from a user\'s balance.',
	async execute(user, userData, amount, profileModel) {
        await profileModel.findOneAndUpdate({
            userID: user.id,
        }, {
            $inc: {
                coins: -parseInt(amount)
            }
        })
	}
}