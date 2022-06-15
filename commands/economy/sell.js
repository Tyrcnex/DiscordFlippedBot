const removeItem = require('../../functions/economy/removeItem.js');
const addMoney = require('../../functions/economy/addMoney.js')
const findItem = require('../../functions/economy/findItem.js');
const getItemInventory = require('../../functions/economy/getItemInventory.js');

module.exports = {
    name: "sell",
    aliases: ["sellitem", "itemsell"],
    permissions: [],
    description: "This is the sell command. Here, you can sell sellable items!",
    usage: "Type \`{prefix} sell [item] [amount (optional)]\`.",
    isGrind: true,
    xpAdd: 1,
    async execute(client, message, cmd, args, Discord, profileModel, profileData, cooldownCheck, additionalInput) {
		if (args.length === 0) { message.reply('how do you sell an item that doesn\'t have a name'); return cooldownCheck.cancel() }

		let inputItem = (!isNaN(args.slice(-1)[0]) || args.slice(-1)[0] === 'max' || args.slice(-1)[0] === 'all') ? args.slice(0,-1).join(' ') : args.join(' ');
		
        const item = await findItem.execute(inputItem);
		if (!item) { message.reply('that item doesn\'t exist what are you doing lol'); return cooldownCheck.cancel() }
        
        if (!profileData.items.map(a => a.name).includes(item.name.toLowerCase())) { message.reply(`You don\'t have this item!`); return cooldownCheck.cancel() }

		if (!item.sell) { message.reply('This isn\'t a sellable item!'); return cooldownCheck.cancel() }
		
        let amount;
        if (args.slice(-1)[0] === 'max' || args.slice(-1)[0] === 'all') amount = (await getItemInventory.execute(profileData, item.name)).amount;
        else amount = !isNaN(args.slice(-1)[0]) ? parseInt(args.slice(-1)[0]) : 1;

        if (amount <= 0) { message.reply('That\'s an invalid number, don\'t try to break me.'); return cooldownCheck.cancel() }

		const sellprice = amount * item.sell;

		await removeItem.execute(message.author, profileData, item.name, amount, profileModel)
		await addMoney.execute(message.author, profileData, sellprice, profileModel)

        var sellEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('Successful business')
        .addFields({name: 'Thank you for your business.', value: `You sold **${amount.toString()} ${item.itemname}${amount > 1 ? "s" : ""}** for **⏣ ${sellprice.toLocaleString()}**`});

        message.reply({ embeds: [sellEmbed] });
    },
};