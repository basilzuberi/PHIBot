const Discord = require("discord.js");
const { secret_token } = require("./config.json");
const client = new Discord.Client();
const command = "!createphirole"; //initial command for setting up
const adminID = "472830919242285066"; //only Moderator role can use command

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(secret_token);
