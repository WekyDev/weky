const Discord = require('discord.js');
const config = require('../../util/config.json');

module.exports.run = async (client, message, args) => {
	const DIG = require('discord-image-generation');
	const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.slice(0).join(' ') || x.user.username === args[0]);
	if (!user) {
		return message.channel.send({ content: 'This command requires two users.Make sure you pinged atleast one user in your message.' });
	}
	const secondMentionedUser = message.mentions.users.array()[1];
	if (!secondMentionedUser) {
		const avatar = user.user.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' });
		const img = await new DIG.Spank().getImage(avatar, message.author.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' }));
		const attachment = new Discord.MessageAttachment(img, 'spank.png');
		message.channel.send({ files: [attachment] });
	}
	else if (secondMentionedUser) {
		const avatar = user.user.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' });
		const img = await new DIG.Spank().getImage(avatar, secondMentionedUser.user.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' }));
		const attachment = new Discord.MessageAttachment(img, 'spank.png');
		message.channel.send({ files: [attachment] });
	}
};

module.exports.help = {
	aliases: [],
	name: 'spank',
	description: 'Spank other users.',
	usage: config.prefix + 'spank @user',
};

module.exports.config = {
	args: false,
	restricted: false,
	category: 'image',
	disable: false,
	cooldown: 1000,
};