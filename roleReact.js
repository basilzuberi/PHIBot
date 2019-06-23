const { Client } = require("discord.js"); //imports for Client, emoji handling and reactions for discord.js
const client = new Client();

var messageID = "592211377771249715";

client.login(process.env.BOT_TOKEN);

client.on("ready", () => {
  //to check if bot is awake
  console.log(`Logged in as ${client.user.tag}!`);
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
            //get ok emoji reaction
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
