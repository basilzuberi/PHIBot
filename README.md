# PHIBot
Bot for the WLU/PHI Discord Server

The bot uses Node.js and the Discord.js library

Link a message's ID to the bot and have users react with an Emoji for them to gain a role, which makes it easier to send messages to anyone interested in recieving updates about the Computer Science Club's activities.

## Extending the Bot

Extending the PHI bot is easy!

You can do it in just two steps:

1. Put your function in `commands.js`  Your function must be in the form `function myfunc( msg ) { ... }`, where `msg` is a [Discord Message Object](https://discordapp.com/developers/docs/resources/channel#message-object).
2. Add your function to the `module.exports` object at the top of the file. The format is `'!my_command' : myfunc`.

That's it! Now messaging `!my_command` in discord will trigger the PHI bot to do its thing.
