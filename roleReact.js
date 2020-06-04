const { Client } = require('discord.js'); //imports for Client, emoji handling and reactions for discord.js
const client = new Client();
const scraper = require('./courseScraper');
const schedule = require('node-schedule');
const moment = require('moment');
const jobs = new Map();
require('dotenv-flow').config();

var messageID = '668623232861208596';

// generates unique event IDs
let uniqueID = 1;

client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
	//to check if bot is awake
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setGame('with Node.JS :)');
});

//create a raw event handler for grabbing the user who reacted

client.on('raw', (event) => {
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
				reactChannel
					.fetchMessage(event.d.message_id)
					.then((msg) => {
						//get ok emoji reaction, future: make into a list to choose from.
						var msgReaction = msg.reactions.get('👌');
						//grab id of users who have reacted to the message.
						var user = client.users.get(event.d.user_id);
						//GOTO: messageReactionAdd event
						client.emit('messageReactionAdd', msgReaction, user);
					})
					.catch((error) => console.log(error)); //log any errors with message handling (expected when no msg available).
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
				reactChannel
					.fetchMessage(event.d.message_id)
					.then((msg) => {
						//get ok emoji reaction, future: make into a list to choose from.
						var msgReaction = msg.reactions.get('👌');
						//grab id of users who have reacted to the message.
						var user = client.users.get(event.d.user_id);
						//GOTO: messageReactionRemove event
						client.emit('messageReactionRemove', msgReaction, user);
					})
					.catch((error) => console.log(error)); //log any errors with message handling (expected when no msg available).
			}
		}
	}
});

//handler for giving roles on reaction add

client.on('messageReactionAdd', (messageReaction, user) => {
	//find role with name of phiRole
	var phiRole = 'PHI';
	var role = messageReaction.message.guild.roles.find((role) => role.name.toLowerCase() === phiRole.toLowerCase());

	if (role) {
		//when we found the role, we need to get the user's id to add the role.
		var member = messageReaction.message.guild.members.find((member) => member.id === user.id);
		if (member) {
			member.addRole(role.id);
		}
	}
});

client.on('messageReactionRemove', (messageReaction, user) => {
	//find role with name of phiRole
	var phiRole = 'PHI';
	var role = messageReaction.message.guild.roles.find((role) => role.name.toLowerCase() === phiRole.toLowerCase());

	if (role) {
		//when we found the role, we need to get the user's id to remove the role.
		var member = messageReaction.message.guild.members.find((member) => member.id === user.id);
		if (member) {
			member.removeRole(role.id);
		}
	}
});

// Message handlers
client.on('message', (msg) => {
	var content = msg.content;
	var command = content.split(' ')[0];

	if (command.substring(0, 1) == '!') {
		console.log(`Command received from ${msg.author}: ${command}`);

		if (command == '!help') {
			msg.channel.send('**Available commands:**\n!course <course code>: Get info on a Laurier course.');
		} else if (command == '!course') {
			var courseID = content.split(' ')[1];
			console.log('Scraping course ' + courseID);

			scraper
				.scrapeCourse(courseID)
				.then((courseInfo) => {
					msg.channel.send(`**${courseID.toUpperCase()} ${courseInfo.title}**\n${courseInfo.description}\n\nRequirements: ${courseInfo.required}\nExclusions: ${courseInfo.exclusions}`);
				})
				.catch(() => {
					msg.channel.send("I couldn't find that course, sorry!");
				});
			// enrolls users into a certain course and assigns them the appropriate role
		} else if (!msg.author.bot && command == '!enroll') {
			const courseID = content.split(' ')[1];
			// Check that course code is valid
			if (courseID && isNaN(courseID.substring(0, 2)) && !isNaN(courseID.substring(2))) {
				const role = msg.guild.roles.find((role) => role.name.toUpperCase() === courseID.toUpperCase());
				// Check if course exists in text channels:
				if (courseID && msg.guild.channels.find((channel) => channel.name === courseID.toLowerCase())) {
					// If role doesn't exist, create it
					if (!role) {
						console.log(`${courseID.toUpperCase()} role does not exist, creating now...`)
						msg.guild.createRole({
							name: courseID.toUpperCase(),
							permissions: [
								'READ_MESSAGES',
								'CHANGE_NICKNAME',
								'SEND_MESSAGES',
								'EMBED_LINKS',
								'ATTACH_FILES',
								'READ_MESSAGE_HISTORY',
								'USE_EXTERNAL_EMOJIS',
								'ADD_REACTIONS',
								'CONNECT',
								'SPEAK',
								'USE_VAD'
							]
							// Assign new role to user
						}).then(function (newRole) {
							msg.member.addRole(newRole);
							msg.channel.send(`${msg.author} You have successfully been enrolled in ${newRole.name}`);
						});
					} else {
						// Check if user has the role already
						if (!msg.member.roles.find((role) => role.name === courseID.toUpperCase())) {
							// Add the role
							msg.member.addRole(role);
							msg.channel.send(`${msg.author} You have successfully been enrolled in ${role.name}`);
						} else {
							// Remove the role
							msg.member.removeRole(role);
							msg.channel.send(`${msg.author} You have successfully been unenrolled from ${role.name}`);
						}
					}
				} else {
					msg.channel.send('!enroll <courseID> [Error: Please ensure that you are using an existing courseID or contact a moderator for further assistance]');
				}
				// If course code is invalid or missing
			} else {
				msg.channel.send(`!enroll <courseID> [Error: Invalid course code or missing parameter]`);
			}
			// Adds a job to the schedule
		} else if (command == '!addEvent' && !msg.author.bot) {
			if (msg.member.roles.find(role => role.name === 'Moderator' || role.name === 'engineer')) {
				let [courseID, hour, minute, day] = content.split(' ').slice(1);
				// check that all params were included and valid
				if ((!Number.isInteger(Number.parseInt(hour)) || hour < 0 || hour > 23) ||
					(!Number.isInteger(Number.parseInt(minute)) || minute < 0 || minute > 59) ||
					(!Number.isInteger(Number.parseInt(day)) || day < 0 || day > 6)) {
					msg.channel.send('!addEvent <courseID> <hour> <minute> <day> [Error: invalid parameters]')
				} else {
					let role = msg.guild.roles.find((role) => role.name.toUpperCase() === courseID.toUpperCase());
					let channel = msg.guild.channels.find((channel) => channel.name === courseID.toLowerCase());
					if (role && channel) {
						let job = createJob(channel, role, courseID, hour, minute, day);
						msg.channel.send(`Event was created successfully:\n${job.name}`);
					} else {
						msg.channel.send(`!addEvent <courseID> <hour> <minute> <day>\n[Error: please check that text channel ${courseID.toLowerCase()} exists and that it's role has been created.]`)
					}

				}
			} else {
				msg.channel.send('Only Moderators can access this function');
			}
			// Lists all events that have been stored in jobs[]
		} else if (command == '!listEvents' && !msg.author.bot) {
			if (msg.member.roles.find(role => role.name === 'Moderator' || role.name === 'engineer')) {
				if (jobs.size == 0)
					msg.channel.send('There are no events. Try creating one using !addEvent');
				else {
					let output = '';
					jobs.forEach(job => output += job.name + '\n');
					msg.channel.send(output);
				}
			} else {
				msg.channel.send('Only Moderators can access this function');
			}
			// Removes event at given index
		} else if (command == `!removeEvent` && !msg.author.bot) {
			if (msg.member.roles.find(role => role.name === 'Moderator' || role.name === 'engineer')) {
				let eventID = content.split(' ')[1];

				if (!eventID) {
					msg.channel.send('!removeEvent <Event ID>');
				} else {
					if (jobs.has(eventID)) {
						let job = jobs.get(eventID);
						job.cancel();
						jobs.delete(eventID);
						msg.channel.send(`Event [${job.name}] has successfully been removed`);
					} else {
						msg.channel.send(`!removeEvents <Event ID> [Error: Event ID ${eventID} not found, try using !listEvents to see Event IDs`);
					}
				}
			} else {
				msg.channel.send('Only Moderators can access this function');
			}
		}
	}
});

/**
 * Create scheduled jobs to ping the appropriate
 * text channels on a scheduled interval.
 */
function createJob(channel, role, courseID, hour, minute, day) {
	let eventID = generateID();
	let job = schedule.scheduleJob(
		`${courseID.toUpperCase()}: ${moment(`${hour}:${minute}:${day}`, 'hh:mm:d').format("dddd [at] hh:mma")} -- Event ID:[${eventID}]`,
		{
			hour: hour,
			minute: minute,
			dayOfWeek: day
		},
		function () {
			channel.send(`${role} Class is starting!`);
		}
	);

	jobs.set(eventID, job);
	uniqueID++;
	return job;
}

/**
 * Generates a pseudo-random ID for an event
 */
function generateID() {
	let result = '';
	for (let i = 0; i < 3; i++) {
		let digit = (Math.floor(Math.random() * uniqueID * 10)) % 10;
		result += digit.toString();
	}
	result += uniqueID.toString() + (Math.floor(Math.random() * uniqueID * 10)) % 10;
	return result;
}
