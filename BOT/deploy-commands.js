const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    {
        name: 'tickets',
        description: 'Create a new ticket',
    },
    {
        name: 'ticket',
        description: 'Create a new ticket',
        options: [
            {
                name: 'close',
                description: 'Close a ticket',
                type: 1, // Type 1 indicates a sub-command
            }
        ]
    },
    {
        name: 'clear',
        description: 'Clear all messages in the channel',
    },
    
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();