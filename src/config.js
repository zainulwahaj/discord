import 'dotenv/config';

function parsePositiveInteger(name, fallbackValue) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue.trim() === '') {
    return fallbackValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsedValue;
}

function parseIdList(rawValue) {
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export const config = {
  discordToken: process.env.DISCORD_TOKEN,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  systemPrompt:
    process.env.SYSTEM_PROMPT || 'You are a helpful assistant. Be concise and direct.',
  maxHistory: parsePositiveInteger('MAX_HISTORY', 20),
  botName: process.env.BOT_NAME || 'GeminiBot',
  allowedChannelIds: parseIdList(process.env.ALLOWED_CHANNEL_IDS),
  ownerDiscordId: process.env.OWNER_DISCORD_ID?.trim() || '',
};

const requiredFields = [
  ['DISCORD_TOKEN', config.discordToken],
  ['GEMINI_API_KEY', config.geminiApiKey],
];

for (const [name, value] of requiredFields) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}
