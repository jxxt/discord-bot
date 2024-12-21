// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,             // To interact with guilds
		GatewayIntentBits.GuildPresences,     // To fetch presence/activity data
		GatewayIntentBits.GuildMembers        // For member data
	],
});

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

// Initialize a Collection for commands
client.commands = new Collection();

// Dynamically load commands from the `commands` folder
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Add the command to the Collection
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

// Handle interaction events
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				ephemeral: true, // Fixed the flag for ephemeral messages
			});
		} else {
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true, // Fixed the flag for ephemeral messages
			});
		}
	}
});
