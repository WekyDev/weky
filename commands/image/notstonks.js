const Discord = require('discord.js');
const config = require('../../util/config.json');

module.exports.run = async (client, message, args) => {

	const DIG = require('discord-image-generation');
	const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === args.slice(0).join(' ') || x.user.username === args[0]) || message.member;
	const avatar = member.user.displayAvatarURL({ format: 'jpg' });
	const img = await new DIG.NotStonk().getImage(avatar);
	const attachment = new Discord.MessageAttachment(img, 'notstonks.png');
	message.channel.send({ files: [attachment] });
};

module.exports.help = {
	aliases: ['nostonks'],
	name: 'notstonks',
	description: 'Putting your pfp in a stonker.',
	usage: config.prefix + 'notstonks {none OR @user}',
};

module.exports.config = {
	args: false,
	restricted: false,
	category: 'image',
	disable: false,
	cooldown: 1000,
};