const { SlashCommandBuilder } = require('discord.js');
const { pass } = require('../config.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		if (interaction.user.id != interaction.author.toString()) {
			interaction.channel.send("User is not ")
		}
		await interaction.reply('Pong!');
	},
};

