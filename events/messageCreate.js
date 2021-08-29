const Discord = require('discord.js');
const utils = require('../util/utils');
const fetch = require('node-fetch');
const requiredUserDB = require('../schemas/userDB');
const pms = require('pretty-ms');
/*  eslint-disable valid-typeof*/

module.exports = async (client, message) => {
	if (message.author.bot || !message.guild) return;

	require('../schemas/userDB').findOne({ id: message.author.id }, async (err, dataUser) => {
		if (!dataUser || typeof dataUser == null) return await client.data.getUserDB(message.author.id);

		const guildDB = await client.data.getGuildDB(message.guild.id);
		const guildDB2 = await require('../schemas/Guild').findOne({ id: message.guild.id });
		const userDB2 = await requiredUserDB.findOne({ id: message.author.id });
		const userDB = await client.data.getUserDB(message.author.id);
		const rpgDB = await client.data;
		const data = {};

		let alreadyReplied;
		data.guild = guildDB;
		data.user = userDB;
		data.rpg = rpgDB;

		if (data.user.blacklisted == true) return;
		if(!userDB2) new requiredUserDB({ id: message.author.id }).save();

		// AMOGUS
		if (guildDB2.amogus.impostorGame == message.author.id && guildDB2.amogus.inWhatChannel == message.channel.id) {
			if (!client.tempCollector[message.author.id]) client.tempCollector[message.author.id] = 0;
			client.tempCollector[message.author.id] += 1;

			if(Object.keys(guildDB2.amogus.whoIsInGame).length <= 3 && alreadyReplied) {
				alreadyReplied = true;
				message.channel.send(`This game has reached 3 players. **${guildDB2.amogus.whoIsInGame[message.author.id] = ' ' + client.users.cache.get(guildDB2.amogus.impostorGame).username}** was the impostor and won!\nDeleting the channel in 10s!`).then(() => {
					setTimeout(() => {
						try{
							message.channel.delete();
						}
						catch(e) {
							return;
						}
					}, 10000);
				});
			}

			if (client.tempCollector[message.author.id] == 100 && guildDB2.amogus.isThereAlreadyAGame) {

				const a = [];
				Object.keys(guildDB2.amogus.whoIsInGame).forEach((id) => {
					message.channel.permissionOverwrites.edit(message.guild.members.cache.get(id), {
						SEND_MESSAGES: false,
						VIEW_CHANNEL: true,
					});
					a.push(guildDB2.amogus.whoIsInGame[message.author.id] + ' 🔪' + guildDB2.amogus.whoIsInGame[id] + '\n');
				});
				message.channel.send({ content: a.join('') });
				message.channel.send({ content:
					guildDB2.amogus.whoIsInGame[message.author.id] +
							'  **' + message.author.username + '**\nGG! The impostor reached 100 messages without being detected! Deleting the channel in 10s!',
				}).then(() => {
					setTimeout(() => {
						try {
							message.channel.delete();
						}
						catch(e) {
							return;
						}
					}, 10000);
				});
			}
		}

		if (userDB2.is_afk) {
			await client.data.removeAfk(message.author.id);
			message.channel.send(Discord.Util.removeMentions('Welcome back `' + message.author.username + '`! You are no longer afk.'));
		}

		message.mentions.users.forEach(async (u) => {
			if (userDB2.is_afk) {
				message.channel.send(Discord.Util.removeMentions(`\`${u.tag}\` is currently afk for: \`${userDB2.afkReason}\``));
			}
		});
		if (data.guild.chatbot_enabled) {
			const channel = data.guild.chatbot_channel;
			if (!channel) return;
			const sendToChannel = message.guild.channels.cache.get(channel);

			if (sendToChannel.id == message.channel.id) {
				try {
					const fetched = await fetch(`https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(message.content)}&botname=${encodeURIComponent('Weky')}&ownername=${encodeURIComponent('Face')}&user=${encodeURIComponent(message.author.id)}`, {});
					const response = await fetched.json();
					message.reply(Discord.Util.removeMentions(response.message));
				}
				catch (e) {
					message.reply({ content: 'Something went wrong while fetching...' });
					console.log(e);
				}
			}
		}
		const prefix = 'wek ';
		if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
			const m = new Discord.MessageEmbed()
				.setTitle('Hi, I\'m Weky !')
				.setDescription('A rpg bot on Discord !')
				.setDescription('My prefix is `' + prefix + '`!')
				.addField('\u200b', '[Support server](https://discord.gg/Sr2U5WuaSN) | [Bot invite](https://discord.com/api/oauth2/authorize?client_id=809496186905165834&permissions=261188086870&scope=applications.commands%20bot)')
				.setColor('RANDOM');
			message.channel.send({ embeds: [m] });
		}

		if (!message.content.toLowerCase().startsWith(prefix)) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/g);

		let command = args.shift().toLowerCase();

		if (dataUser.cooldowns[command] < Date.now()) await requiredUserDB.findOneAndUpdate({ id: message.author.id }, delete dataUser.cooldowns[command], { upset: true });


		if (client.aliases.has(command)) {
			command = client.commands.get(client.aliases.get(command)).help.name;
		}

		const commandFile = client.commands.get(command);

		if (!commandFile) return;

		if (client.commands.get(command).config.restricted == true) {
			if (data.user.moderator == false) {
				return utils.errorEmbed(message, 'This command is only for bot moderators.');
			}
		}

		if (client.commands.get(command).config.disable == true) {
			return utils.errorEmbed(message, 'This command is disabled!');
		}


		const cooldown = client.commands.get(command).config.cooldown;

		const value = dataUser.premium ? cooldown / 2 : cooldown;

		if (dataUser.cooldowns[command] > Date.now()) {

			const timeLeft = pms(dataUser.cooldowns[command] - Date.now());
			return message.channel.send({ content: utils.emojis.timer + ' | This command is in cooldown for `' + timeLeft + '`! Its default cooldown is ' + pms(value) + '!' });
		}

		try {
			await commandFile.run(client, message, args, utils, data);

			// await client.channels.cache.get('835464023163535380').send({ embeds: [new Discord.MessageEmbed()
			// 	.setColor('RANDOM')
			// 	.setDescription('```md' +
			// 		'\n* Command\n> ' + command +
			// 		'\n* Content\n> ' + message.content +
			// 		'\n* Guild\n> ' + message.guild.name +
			// 		'\n* User ID\n> ' + message.author.id +
			// 		'\n* Guild ID\n> ' + message.guild.id +
			// 		'\n```',
			// 	)
			// 	.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: 'jpg', dynamic: true }))
			// ]});

			dataUser.cooldowns[command] = Date.now() + value;
			await requiredUserDB.findOneAndUpdate({ id: message.author.id }, dataUser, { upset: true });
		}
		catch (error) {

			await message.channel.send({ embeds: [new Discord.MessageEmbed()
				.setColor('RANDOM')
				.setDescription('```md' +
					'\n# ERROR\n> ' + error +
					'\n* Command\n> ' + command +
					'\n* Content\n> ' + message.content +
					'\n* Guild\n> ' + message.guild.name +
					'\n* User ID\n> ' + message.author.id +
					'\n* Guild ID\n> ' + message.guild.id +
					'\n```',
				)
				.setAuthor(message.author.tag, message.author.displayAvatarURL({ format: 'jpg', dynamic: true })),
			] });
			console.log(error);

			return message.channel.send({ embeds: [
				new Discord.MessageEmbed()
					.setTitle('Something went wrong...')
					.setDescription('Please report it in our [support server](https://discord.gg/Sr2U5WuaSN)')
					.setColor('RED'),
			] });
		}
	});
};
