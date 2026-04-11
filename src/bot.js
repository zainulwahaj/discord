import { ChannelType } from 'discord.js';

import { config } from './config.js';
import { askGemini } from './gemini.js';
import { memory } from './memory.js';

const processingChannels = new Set();

function stripBotMention(content, botUserId) {
  const mentionPattern = new RegExp(`<@!?${botUserId}>`, 'g');
  return content.replace(mentionPattern, '').trim();
}

function splitReply(content, maxLength = 1900) {
  const trimmedContent = content.trim();
  if (trimmedContent.length <= maxLength) {
    return [trimmedContent];
  }

  const chunks = [];
  let remaining = trimmedContent;

  while (remaining.length > maxLength) {
    let splitIndex = remaining.lastIndexOf('\n', maxLength);
    if (splitIndex < Math.floor(maxLength * 0.6)) {
      splitIndex = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitIndex < Math.floor(maxLength * 0.6)) {
      splitIndex = maxLength;
    }

    chunks.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trimStart();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}

async function replyToMessage(message, content) {
  await message.reply({
    content,
    allowedMentions: {
      repliedUser: false,
    },
  });
}

async function sendBusySignal(message) {
  try {
    await message.react('⏳');
    return;
  } catch (error) {
    console.warn('[Busy Signal Error]', error);
  }

  await replyToMessage(message, '⏳ Still processing the previous message for this channel.');
}

async function sendModelReply(message, reply) {
  const chunks = splitReply(reply);
  const [firstChunk, ...rest] = chunks;

  await replyToMessage(message, firstChunk);

  for (const chunk of rest) {
    await message.channel.send(chunk);
  }
}

function isOwner(authorId) {
  return Boolean(config.ownerDiscordId) && authorId === config.ownerDiscordId;
}

export async function handleMessage(message, client) {
  const { author, channel, content, guild } = message;

  if (author.bot) {
    return;
  }

  const isDM = channel.type === ChannelType.DM;
  const isMentioned = message.mentions.has(client.user);

  if (!isDM && !isMentioned) {
    return;
  }

  if (
    config.allowedChannelIds.length > 0 &&
    guild &&
    !config.allowedChannelIds.includes(channel.id)
  ) {
    return;
  }

  const cleanContent = isDM ? content.trim() : stripBotMention(content, client.user.id);

  if (cleanContent === '!clear') {
    if (!config.ownerDiscordId) {
      await replyToMessage(message, '❌ `OWNER_DISCORD_ID` is not configured, so `!clear` is disabled.');
      return;
    }

    if (!isOwner(author.id)) {
      await replyToMessage(message, '❌ Only the configured owner can clear channel history.');
      return;
    }

    memory.clear(channel.id);
    await replyToMessage(message, '🗑️ Conversation history cleared for this channel.');
    return;
  }

  if (!cleanContent) {
    await replyToMessage(message, '⚠️ Mention me with a prompt, or send a DM.');
    return;
  }

  if (processingChannels.has(channel.id)) {
    await sendBusySignal(message);
    return;
  }

  processingChannels.add(channel.id);

  try {
    try {
      await channel.sendTyping();
    } catch (error) {
      console.warn('[Typing Indicator Error]', error);
    }

    const history = memory.getHistory(channel.id, config.maxHistory);
    memory.save(channel.id, 'user', cleanContent);

    const reply = await askGemini(history, cleanContent);

    memory.save(channel.id, 'model', reply);
    await sendModelReply(message, reply);
  } catch (error) {
    console.error('[Bot Error]', error);
    await replyToMessage(message, '❌ Internal error. Check bot logs.');
  } finally {
    processingChannels.delete(channel.id);
  }
}
