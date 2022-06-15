module.exports = {
	functionName: 'suffixItem',
	description: 'Adds a suffix to an item\'s name',
	execute(itemname, suffix, removeNum) {
        if (!suffix && typeof removeNum === 'undefined') return itemname + `s`;
        if (suffix && typeof removeNum === 'undefined') return itemname + suffix;
        if (suffix && typeof removeNum !== 'undefined') return itemname.slice(0, -removeNum) + suffix
	}
}