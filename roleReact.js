const { Client } = require("discord.js"); //imports for Client, emoji handling and reactions for discord.js
const client = new Client();
const scraper = require('./courseScraper');

var messageID = "668623232861208596";

client.login(process.env.BOT_TOKEN);

client.on("ready", () => {
  //to check if bot is awake
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setGame("with Node.JS :)");
});

//create a raw event handler for grabbing the user who reacted

client.on('raw', event => {
  const eventName = event.t;
  //check event handler for reaction add
  if (eventName === 'MESSAGE_REACTION_ADD') {
    if (event.d.message_id === messageID) {
      var reactChannel = client.channels.get(event.d.channel_id);
      //check if we ALREADY have cached the message we shall react to.
      if (reactChannel.messages.has(event.d.message_id)) {
        return;
      } else {
        //this will get the message if we haven't cached it. THEN it will grab the emoji
        reactChannel.fetchMessage(event.d.message_id)
          .then(msg => {
            //get ok emoji reaction, future: make into a list to choose from.
            var msgReaction = msg.reactions.get("👌");
            //grab id of users who have reacted to the message.
            var user = client.users.get(event.d.user_id);
            //GOTO: messageReactionAdd event
            client.emit('messageReactionAdd', msgReaction, user);
          })
          .catch(error => console.log(error));//log any errors with message handling (expected when no msg available).
      }
    }
  }
  //check event handler for reaction removal.
  else if (eventName === 'MESSAGE_REACTION_REMOVE') {
    if (event.d.message_id === messageID) {
      var reactChannel = client.channels.get(event.d.channel_id);
      if (reactChannel.messages.has(event.d.message_id)) {
        return;
      } else {
        //this will get the message if we haven't cached it. THEN it will grab the emoji
        reactChannel.fetchMessage(event.d.message_id)
          .then(msg => {
            //get ok emoji reaction, future: make into a list to choose from.
            var msgReaction = msg.reactions.get("👌");
            //grab id of users who have reacted to the message.
            var user = client.users.get(event.d.user_id);
            //GOTO: messageReactionRemove event
            client.emit('messageReactionRemove', msgReaction, user);
          })
          .catch(error => console.log(error));//log any errors with message handling (expected when no msg available).
      }
    }
  }
});

//handler for giving roles on reaction add

client.on('messageReactionAdd', (messageReaction, user) => {

  //find role with name of phiRole
  var phiRole = "PHI";
  var role = messageReaction.message.guild.roles.find(role => role.name.toLowerCase() === phiRole.toLowerCase());


  if (role) {
    //when we found the role, we need to get the user's id to add the role.
    var member = messageReaction.message.guild.members.find(member => member.id === user.id);
    if (member) {
      member.addRole(role.id);
    }
  }

});


client.on('messageReactionRemove', (messageReaction, user) => {
  //find role with name of phiRole
  var phiRole = "PHI";
  var role = messageReaction.message.guild.roles.find(role => role.name.toLowerCase() === phiRole.toLowerCase());


  if (role) {
    //when we found the role, we need to get the user's id to remove the role.
    var member = messageReaction.message.guild.members.find(member => member.id === user.id);
    if (member) {
      member.removeRole(role.id);
    }
  }
});

// Message handlers
client.on('message', msg => {
  var content = msg.content;
  var command = content.split(" ")[0];

  if (command.substring(0,1) == "!") {
    console.log(`Command received from ${msg.author}: ${command}`);

    if (command == "!help") {
      msg.channel.send("**Available commands:**\n!course <course code>: Get info on a Laurier course.")
    }

    else if (command == "!course") {
      var courseID = content.split(" ")[1];
      console.log("Scraping course " + courseID);
  
      scraper.scrapeCourse(courseID)
      .then((courseInfo) => {
        msg.channel.send(`**${courseID.toUpperCase()} ${courseInfo.title}**\n${courseInfo.description}\n\nRequirements: ${courseInfo.required}\nExclusions: ${courseInfo.exclusions}`);
      })
      .catch(() => {
        msg.channel.send("I couldn't find that course, sorry!");
      });
    }
  }
});