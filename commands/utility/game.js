const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("game")
		.setDescription("Provides information about what the user is currently playing."),
	async execute(interaction) {
		// Check for member presence
		const presence = interaction.member.presence;

		// If no presence, inform the user
		if (!presence) {
			await interaction.reply(`${interaction.user.username} has no activity status or presence data.`);
			return;
		}

		// Check activities for a "Playing" status
		const gameActivity = presence.activities.find((activity) => activity.type === 0); // 0 = Playing

		if (gameActivity) {
			// Calculate duration if start timestamp is available
			let durationMessage = "";
			if (gameActivity.timestamps?.start) {
				const startTime = gameActivity.timestamps.start;
				const elapsedTime = Date.now() - startTime; // In milliseconds
				const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
				const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
				durationMessage = ` They have been playing for ${hours} hour(s) and ${minutes} minute(s).`;
			}

			// Respond with the game name and duration
			await interaction.reply(`${interaction.user.username} is playing ${gameActivity.name}.${durationMessage}`);
		} else {
			// No game detected
			await interaction.reply(`${interaction.user.username} is not playing a game right now.`);
		}
	},
};
