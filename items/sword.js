module.exports = {
    name: 'sword',
    itemname: 'Sword',
    aliases: ['swoosh'],
    emoji: `<a:Sword:969096910558363658>`,
    price: 10500,
    sell: 2350,
    description: 'Slice!',
    multiUse: true,
    async use(client, message, cmd, args, Discord, user, profileModel, userData, amount, cooldownCheck, additionalInput, changes){
        changes.returnMessageContent = `Swish! Slice!`;
        return changes.loss = true;
    }
}