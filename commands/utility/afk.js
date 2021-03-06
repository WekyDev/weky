const Discord = require('discord.js');
module.exports.run = async (client, message, args) => {
	const afkreason = args.join(' ') || 'AFK';

	client.data.setAfk(message.author.id, afkreason);
	message.channel.send({ content: Discord.Util.removeMentions(`You are now afk for: **\`${afkreason}\`**`) });
};


module.exports.help = {
	aliases: [],
	name: 'afk',
	description: 'Set afk',
	usage: '..afk %reason%',
};

module.exports.config = {
	args: false,
	restricted: false,
	category: 'utility',
	disable: false,
	cooldown: 1000,
};