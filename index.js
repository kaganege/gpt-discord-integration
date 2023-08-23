import { Client, GatewayIntentBits } from "discord.js";
import OpenAI from "openai";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const openai = new OpenAI();
const data = new Map();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  const content = message.content.trim();

  if (
    message.author.bot ||
    message.channel.id !== process.env.CHANNEL_ID ||
    (content !== ".sıfırla" && content.startsWith("."))
  )
    return;

  if (content === ".sıfırla") {
    if (data.has(message.author.id)) data.delete(message.author.id);

    await message.reply("Önceki konuşmalarınız sıfırlandı!");
    return;
  }

  await message.channel.sendTyping();

  const userData = [...(data.get(message.author.id) || []), { role: "user", content }];
  data.set(message.author.id, userData);

  const completion = await openai.chat.completions.create({
    messages: userData,
    model: "gpt-3.5-turbo",
  });

  const answer = completion.choices[0].message;
  data.set(message.author.id, [...userData, answer]);

  await message.reply({
    content: answer.content,
  });
});

client.login(process.env.TOKEN);
