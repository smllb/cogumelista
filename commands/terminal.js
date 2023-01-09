const { SlashCommandBuilder, Message, MessageEmbed, messageLink } = require('discord.js');
const process = require("child_process");
const data = new SlashCommandBuilder()
module.exports = {
    data: new SlashCommandBuilder()
    .setName('terminal')
    .setDescription('Terminal commands')
    .addStringOption(option =>
		option.setName('user-input')
			.setDescription('Command to be executed')
            .setRequired(true)),        
    async execute(interaction) {
        const userInput = interaction.options.getString('user-input');
        if (interaction.user.id != '320287818838441994') {
            interaction.channel.send(`userID:  ${interaction.user.id} should be 320287818838441994` );
            console.log(interaction.user.id);
            return
        }
        
        process.exec(userInput, (err, res) => {
            if (err) return console.log(err);

            interaction.reply(res.slice(0,2000), { code: "js" });
        })
    },
};