const addItem = require('../../functions/economy/addItem.js');
const removeMoney = require('../../functions/economy/removeMoney.js')
const findItem = require('../../functions/economy/findItem.js');

module.exports = {
    name: "buy",
    aliases: ["getitem", "itembuy"],
    permissions: [],
    description: "This is the buy command. Here, you can buy items from the shop!",
    usage: "Type \`{prefix} buy [item]\`.",
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		if (args.length === 0) { message.reply('lol you\'re not supposed to buy an item that doesn\'t have a name'); return cooldownCheck.cancel() }

		let inputItem = (!isNaN(args.slice(-1)[0]) || args.slice(-1)[0] === 'max' || args.slice(-1)[0] === 'all') ? args.slice(0,-1).join(' ') : args.join(' ');

        const item = await findItem.execute(inputItem);
		if (!item) { message.reply('that item doesn\'t exist what are you doing lol'); return cooldownCheck.cancel() }
		if (!item.price) { message.reply('That item isn\'t in the shop, so you can\'t buy it lol'); return cooldownCheck.cancel() }

        let amount;
        if (args.slice(-1)[0] === 'max' || args.slice(-1)[0] === 'all') amount = Math.floor(profileData.coins / item.price)
        else amount = !parseInt(args.slice(-1)[0]) === false ? parseInt(args.slice(-1)[0]) : 1;

        if (amount <= 0) { message.reply('That\'s an invalid number, don\'t try to break me.'); return cooldownCheck.cancel() }
		
		const price = amount * item.price;
		if (price > profileData.coins) {
			if (price <= profileData.coins + profileData.bank) { message.reply('you don\'t have enough money in your wallet, go withdraw some money from your bank.'); return cooldownCheck.cancel(); }
			if (price > profileData.coins + profileData.bank) { message.reply('lol you are too poor for this purchase'); return cooldownCheck.cancel(); }
		}

		await addItem.execute(message.author, profileData, item.name, amount, profileModel)
		await removeMoney.execute(message.author, profileData, price, profileModel);

        var boughtEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('Successful purchase')
        .addFields({name: 'Thank you for your purchase.', value: `You bought **${amount.toLocaleString()} ${item.itemname}${amount > 1 ? "s" : ""}** for **⏣ ${price.toLocaleString()}**`});

        message.reply({ embeds: [boughtEmbed] });
    },
};