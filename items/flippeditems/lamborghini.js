module.exports = {
    name: 'lamborghini',
    itemname: 'Lamborghini',
    aliases: ['lambo', 'lamboghini'],
    emoji: `<:Lamborghini:969096909782392872>`,
    price: 5600,
    sell: 2300,
    description: 'Vroom!',
    multiUse: false,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        changes.loss = true;
        return changes.returnMessageContent = `Vroom!`;
    }
}