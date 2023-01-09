const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
module.exports = {
    data: new SlashCommandBuilder()
    .setName('tolerance')
    .setDescription('Return how much you need to consume to get the same effects as the last dosage')
    .addNumberOption(option =>
		option.setName('last-dosage')
			.setDescription('Amount consumed in the last dosage.')
            .setRequired(true))
    .addNumberOption(option =>
        option.setName('desired-dosage')
        .setDescription('Desired dosage.')
        .setRequired(true))
    .addNumberOption(option =>
        option.setName('days-since-last-consumption')
            .setDescription('Days since last consumption.')
            .setRequired(true)),
    async execute(interaction) {
        const lastDosage = interaction.options.getNumber('last-dosage');
        const desiredDosage = interaction.options.getNumber('desired-dosage');
        const lastConsumption = interaction.options.getNumber('days-since-last-consumption');
        calculateRequiredDoseForTheSameEffect = (x1, x2, n) => {
            var estimatedDosage = x2 + (((x1 / 100)* (280.059565 * Math.pow(n, -0.412565956))) - x1)
            var newAmount = ((estimatedDosage < x2) ? x2 : estimatedDosage);
            return Math.round(newAmount * 10) / 10;
        }
        let requiredDose = calculateRequiredDoseForTheSameEffect(lastDosage, desiredDosage, lastConsumption);
        await interaction.reply(`lastDosage: ${lastDosage} | desiredDosage: ${desiredDosage} | daysSinceLastConsumption ${lastConsumption} | Required dosage: ${requiredDose}` );
    },
};