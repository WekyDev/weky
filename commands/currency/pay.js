const rpgSchema = require('../../schemas/rpg');
/*  eslint-disable valid-typeof*/

module.exports.run = async (client, message, args, utils, data) => {
	await rpgSchema.findOne({ id: message.author.id }).lean().exec().then(async (extractedData) => {
		if (!extractedData || typeof extractedData == null) return client.data.addUser(message.author.id, message);
		const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.slice(0).join(' ') || x.user.username === args[0]) || message.member;

		if (!args[0]) return utils.errorEmbed(message, 'No aero amount specified!');
		if (isNaN(parseInt(args[0]))) return utils.errorEmbed(message, 'The specified amount of aero is NaN!');
		if (parseInt(args[0]) < 100) return utils.errorEmbed(message, 'The specified amount of aero is not 100+!');
		if (!user) return utils.errorEmbed(message, 'No user specified!');
		if (extractedData.aero < parseInt(args[0])) return utils.errorEmbed(message, 'Sorry! You specified more aero than you have!');

		data.rpg.modify(message.author.id, 'aero', Math.round(parseInt(args[0]), message), '-=');
		data.rpg.addAero(user.user.id, Math.round(parseInt(args[0])), message);
		message.reply({ content:utils.emojis.share + ` | **${message.author.username}** gave **${user.user.username}** \`${Math.round(parseInt(args[0])).toLocaleString('en') + '` ' + utils.emojis.aero}. ${user.user.id === message.author.id ? 'DIES OF CRINGE' : ''}` });
	});
};
module.exports.help = {
	aliases: ['share', 'give', 'gib'],
	name: 'pay',
	description: 'Pay someone!',
	usage: 'wek pay <amount> @user',
};

module.exports.config = {
	args: false,
	restricted: false,
	category: 'currency',
	cooldown: 30000,
	disable: false,
};