const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ChannelType, PermissionsBitField } = require('discord.js');
const { token, adminRoleId, ticketscatId, ticketChannelId, annterznId } = require('../config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let response;
let service;
let ticketChannelNumber = 0;

client.once('ready', () => {
    console.log('/tickets is available!');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        if (interaction.commandName === 'tickets') {

            if (interaction.channelId !== ticketChannelId) {
                await interaction.reply({ content: 'This command can only be used in the ticket channel.', ephemeral: true });
                return;
            }

            if (interaction.user.id !== annterznId) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command', ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFBB00)
                .setTitle('Interested in hire a developper ?')
                .setDescription('To create a ticket, start by selecting your project')
                .setThumbnail('https://click123.ca/wp-content/uploads/2014/03/developpement-web.jpg');

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-service')
                .setPlaceholder('Select an option')
                .addOptions([
                    {
                        label: 'Make a portofolio website',
                        value: 'portofolio',
                    },
                    {
                        label: 'Create a mobile App',
                        value: 'mobile_app',
                    },
                    {
                        label: 'Create a Discord Bot',
                        value: 'discord_bot',
                    },
                    {
                        label: 'Make an hardware project',
                        value: 'hardware',
                    },
                    {
                        label: 'Make a computer App',
                        value: 'computer_app',
                    }
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ embeds: [embed], components: [row] });


        } else if (interaction.commandName === 'ticket' && interaction.options.getSubcommand() === 'close') {
            // Vérifiez si l'utilisateur a le rôle admin
            if (!interaction.member.roles.cache.has(adminRoleId)) {
                await interaction.reply({ content: 'You do not have the required permissions to use this command.', ephemeral: true });
                return;
            }

            // Vérifiez si le salon est un salon de tickets
            if (interaction.channel.parentId !== ticketscatId) {
                await interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });
                return;
            }

            // Supprimez le salon de tickets
            try {
                await interaction.reply({ content: 'This ticket will be closed and the channel will be deleted.', ephemeral: true });
                await interaction.channel.delete();
            } catch (error) {
                console.error('Error while deleting the channel:', error);
                await interaction.reply({ content: 'There was an error trying to close this ticket.', ephemeral: true });
            }
        }
    
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select-service') {

            if (interaction.values && interaction.values.length > 0) {
                if (interaction.values[0] === 'portofolio') {
                    response = 'portofolio';
                    service = 'Make a portofolio website';
                    console.log(interaction.user.username, response);
                } else if (interaction.values[0] === 'mobile_app') {
                    response = 'mobile_app';
                    service = 'Create a mobile App';
                    console.log(interaction.user.username, response);
                } else if (interaction.values[0] === 'discord_bot') {
                    response = 'discord_bot';
                    service = 'Create a Discord Bot';
                    console.log(interaction.user.username, response);
                } else if (interaction.values[0] === 'hardware') {
                    response = 'hardware';
                    service = 'Make an hardware project';
                    console.log(interaction.user.username, response);
                } else if (interaction.values[0] === 'computer_app') {
                    response = 'computer_app';
                    service = 'Make a computer App';
                    console.log(interaction.user.username, response);
                }

                if (response === 'portofolio') {
                    const modal = new ModalBuilder() 
                        .setCustomId('portofolio-modal')
                        .setTitle('Make a Portofolio Website');

                    const whyInput = new TextInputBuilder()
                        .setCustomId('why-input')
                        .setLabel('Why do you want to make a portofolio')
                        .setStyle(TextInputStyle.Paragraph);

                    const pageNumberInput = new TextInputBuilder()
                        .setCustomId('number-page-input')
                        .setLabel('Enter the number of webpages')
                        .setStyle(TextInputStyle.Short);

                    const notesInput = new TextInputBuilder() 
                        .setCustomId('notes-input')
                        .setLabel('Enter any optional notes')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false);

                    const whyInputRow = new ActionRowBuilder().addComponents(whyInput);
                    const pageNumberRow = new ActionRowBuilder().addComponents(pageNumberInput);
                    const notesInputRow = new ActionRowBuilder().addComponents(notesInput);

                    modal.addComponents(whyInputRow, pageNumberRow, notesInputRow);

                    await interaction.showModal(modal);

                } else {
                    await interaction.reply({ content: 'Not built anymore' });
                }
            } else {
                await interaction.reply({ content: 'No service selected.', ephemeral: true });
            }
        }
    } else if (interaction.type === InteractionType.ModalSubmit) {
        if (interaction.customId === 'portofolio-modal') {
            const reason = interaction.fields.getTextInputValue('why-input');
            const pagenumber = interaction.fields.getTextInputValue('number-page-input');
            const notes = interaction.fields.getTextInputValue('notes-input') || 'No additional notes';

            // Création du salon textuel pour le ticket dans la catégorie spécifiée
            const guild = interaction.guild;
            ticketChannelNumber = ticketChannelNumber + 1;
            const ticketChannel = await guild.channels.create({
                name: `ticket-${ticketChannelNumber}`,
                type: ChannelType.GuildText,
                parent: ticketscatId,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ],
                    },
                    {
                        id: adminRoleId,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ],
                    },
                ],
            });

            console.log('Nouveau salon créé');

            // Création de l'embed pour le récapitulatif
            const recapEmbed = new EmbedBuilder()
                .setColor(0xFFBB00)
                .setTitle('Ticket Summary')
                .addFields(
                    { name: 'Why you want to make a portofolio:', value: reason, inline: false },
                    { name: 'Number of Pages:', value: pagenumber, inline: false },
                    { name: 'Notes about your project:', value: notes, inline: false },
                );

            // Envoi du message récapitulatif avec lien vers le nouveau salon textuel
            await interaction.reply({ content: `✅ You chose to make a portofolio website! Notes: ${notes}. You can follow your request in <#${ticketChannel.id}>.`, ephemeral: true });

            // Envoi du message récapitulatif dans le nouveau salon textuel
            await ticketChannel.send({ embeds: [recapEmbed] });
        } else {
            interaction.reply({ content: 'Not Built Yet', ephemeral: true });
        }
    }
});

client.login(token);
