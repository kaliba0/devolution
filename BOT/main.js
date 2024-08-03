require('./commands/tickets.js');
require('./commands/clear.js');

const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const express = require('express');
const app = express();
const PORT = 3045;
const cors = require('cors');
app.use(cors());


const config = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

app.use(express.json());

let TicketNumber = 0;

app.post('/create-channel', async (req, res) => {
    const { productName, discordId } = req.body;
    try {
        const guild = await client.guilds.fetch(config.guildId);

        // Créer le salon privé
        TicketNumber= TicketNumber+1;
        const channel = await guild.channels.create({
            name: 'ticket-' + TicketNumber,
            type: ChannelType.GuildText,
            parent: config.ticketscatId,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id, // Refuser l'accès à tout le monde
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: config.adminRoleId, // Autoriser l'accès aux administrateurs
                    allow: [PermissionsBitField.Flags.ViewChannel],
                }
            ],
        });

        // Créer une invitation
        const invite = await channel.createInvite({
            maxUses: 1, // L'invitation ne peut être utilisée qu'une seule fois
            unique: true,
        });

        // Envoyer un message privé à l'utilisateur avec l'invitation
        const user = await client.users.fetch(discordId);
        await user.send(`Bonjour, un salon privé a été créé pour votre commande. Rejoignez-le en utilisant cette invitation : ${invite.url}`);

        channel.send(`Nouveau service acheté : ${productName}`);
        res.status(200).send('Channel created and invite sent');
    } catch (error) {
        console.error('Error creating channel or sending invite:', error);
        res.status(500).send('Error creating channel or sending invite');
    }
});

client.login(config.token);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
