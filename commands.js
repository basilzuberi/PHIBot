const scraper = require('./courseScraper');

// List of handlers for message reactions
var commands = {
  "!help" : helpCmd,
  "!course" : courseCmd
};
export commands;

// !help handler
function helpCmd( msg ) {
  msg.channel.send("**Available commands:**\n!course <course code>: Get info on a Laurier course.");
}

function courseCmd( msg ) {
  var courseID = msg.content.split(" ")[1];
  console.log("Scraping course " + courseID);
  
  scraper.scrapeCourse(courseID)
    .then((courseInfo) => {
      msg.channel.send(`**${courseID.toUpperCase()} ${courseInfo.title}**\n${courseInfo.description}\n\nRequirements: ${courseInfo.required}\nExclusions: ${courseInfo.exclusions}`);
  })
  .catch(() => {
    msg.channel.send("I couldn't find that course, sorry!");
  });
}

