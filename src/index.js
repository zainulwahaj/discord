import { Client, GatewayIntentBits, Partials } from 'discord.js';

import { handleMessage } from './bot.js';
import { config } from './config.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.once('ready', () => {
  console.log(`[${config.botName}] Logged in as ${client.user.tag}`);
  console.log(`[${config.botName}] Watching ${client.guilds.cache.size} server(s)`);
});

client.on('messageCreate', (message) => {
  void handleMessage(message, client);
});

client.on('error', (error) => {
  console.error('[Discord Error]', error);
});

client.login(config.discordToken).catch((error) => {
  console.error('[Login Error]', error);
  process.exitCode = 1;
});
