import { Client, GatewayIntentBits, Partials } from 'discord.js';

import { handleMessage } from './bot.js';
import { config } from './config.js';

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.DirectMessages,
];

if (config.enableMessageContentIntent) {
  intents.push(GatewayIntentBits.MessageContent);
}

const client = new Client({
  intents,
  partials: [Partials.Channel],
});

client.once('clientReady', () => {
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
