const { Client, Emoji, MessageReaction } = require("discord.js"); //imports for Client, emoji handling and reactions for discord.js
const { secretToken, adminID } = require("./config.json"); //shh secret token is secret.
const command = "!createphirole"; //initial command for setting up
const client = new Client();




client.login(secretToken);

client.on("ready", () => {
  //to check if bot is awake
  console.log(`Logged in as ${client.user.tag}!`);
});

//only send initial messages when admin says command
client.on("message", msg => {
  if (msg.member.roles.has(adminID) && msg.content.toLowerCase() == command) {
    msg.channel.send("Hi, Please react with the :ok_hand: emoji to gain the PHI Role! You will be notified of any PHISOC Related activities going on. :)")

    //after sending message, add reaction

  }
});
