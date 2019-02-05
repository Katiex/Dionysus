var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var dares = require('./dares.json');
var users = require('./userData.json');
var fs = require("fs");
//var users = [];
var newUser, i, curUser, score;
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
	
	
	
});




bot.on('message', function (user, userID, channelID, message, evt) {
	
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
		newUser = 1;
		n = 0;
		
		for (i = 0; i < users.length; i++) {
			if (userID == users[i][1]) {
				newUser = 0
				n = i
			}
		}
		
		if (newUser == 1) {
			users.push([user,userID,5,0,[]]);
			n = users.length - 1;
		}
		
        switch(cmd) {
            // !dare
			
			case 'skip':
			
				if (users[n][2] >= 15) {
				
					users[n][2] = users[n][2] - 15;
					
					users[n][4].splice(args[0],1);
					
					bot.sendMessage({
						to: channelID,
						message: 'Slot ' + args[0] + ' cleared'
					});
				} else {
					bot.sendMessage({
						to: channelID,
						message: 'You do not have the points to skip!'
					});
				}
			
			break;
			
            case 'dare':
				var obj_keys = Object.keys(dares);
				var ran_key = obj_keys[Math.floor(Math.random() *obj_keys.length)];
				
				if (users[n][2] < 5) {
					bot.sendMessage({
						to: channelID,
						message: 'You do not have the points for a dare!, try writing one with !new <Dare instructions here>'
					});
				} else if (users[n][5] <= users[n][4].length ) {
					bot.sendMessage({
						to: channelID,
						message: 'All of your slots are full! Try using !Skip n, with n being the number of the dare you wish to skip\nBe careful, this costs 15 points!'
					});
				} else {
					
					users[n][2] = users[n][2] - 5;
					
					if (users[n][2] >= 500) {
						users[n][5] = 5;
					} else if (users[n][2] >= 250) {
						users[n][5] = 4;
					} else if (users[n][2] >= 100) {
						users[n][5] = 3;
					} else if (users[n][2] >= 50) {
						users[n][5] = 2;
					} else {
						users[n][5] = 1;
					}
					
					users[n][4].push(ran_key);
					
					daren = users[n][4].length - 1;
							
					bot.sendMessage({
						to: channelID,
						message: ran_key + '\nThis dare is from ' + dares[ran_key] + '\nYou must complete this dare and post a picture as proof' + '\nThen get another user to confirm your dare with !confirm ' + userID + daren
					});
							
				}
				
				fs.writeFile("./userData.json", JSON.stringify(users), function(err) {
					if (err) {
						console.log(err);
						bot.sendMessage({
							to: channelID,
							message: 'Failed to save score, dionysis is sorry'
						});
					} else {
						// Score saved
					}
				});
				
			break;
			
			case 'confirm':
				
				for (i = 0; i < users.length; i++) {
					if (users[i][1] == Math.floor(args[0]/10)) {
						if (users[i][1] == userID) {
							bot.sendMessage({
								to: channelID,
								message: 'You cannot confirm your own dare!'
							});
						} else if (args[0]%10 < users[i][4].length) {
							users[i][2] = users[i][2] + 20;
							users[i][4].splice(((args[0][(args[0].length - 1)])),1);
							
							if (users[i][2] >= 500) {
								users[i][5] = 5;
							} else if (users[i][2] >= 250) {
								users[i][5] = 4;
							} else if (users[i][2] >= 100) {
								users[i][5] = 3;
							} else if (users[i][2] >= 50) {
								users[i][5] = 2;
							} else {
								users[i][5] = 1;
							}
							
							bot.sendMessage({
								to: channelID,
								message: 'You have confirmed ' + users[i][0] + '\'s dare'
							});
						} else {
							bot.sendMessage({
								to: channelID,
								message: 'No dare found!'
							});
						}
					}
				}
				
				fs.writeFile("./userData.json", JSON.stringify(users), function(err) {
					if (err) {
						console.log(err);
						bot.sendMessage({
							to: channelID,
							message: 'Failed to save score, dionysis is sorry'
						});
					} else {
						// Score saved
					}
				});
				
            break;
			
			case 'remind':
			
				if ( users[n][4] != null ) {
					
					remindMessage = ''
					
					for (i = 0; i < users[n][4].length; i++) {
						
						remindMessage = remindMessage + 'Slot ' + i + '\n'
						
						if (users[n][4][i] != null) {
							
							remindMessage = remindMessage + users[n][4][i] + '\nThis dare is from ' + dares[users[n][4][i]] + '\nYou must complete this dare and post a picture as proof' + '\nThen get another user to confirm your dare with !confirm ' + userID + i + '\n' + '\n'
							
						}
					}
					
					bot.sendMessage({
						to: channelID,
						message: remindMessage
					});
						
				} else {
					
					bot.sendMessage({
						to: channelID,
						message: 'No dare found'
					});
					
				}
				
				
            break;

			case 'score':
			
				bot.sendMessage({
					to: channelID,
					message: 'Your score is ' + users[n][2]
				});
				
            break;
			
			case 'new':
				
				dares[message.substr(5)] = user;
				
				users[n][2] = users[n][2] + 5;
				
				if (users[n][2] >= 500) {
					users[n][5] = 5;
				} else if (users[n][2] >= 250) {
					users[n][5] = 4;
				} else if (users[n][2] >= 100) {
					users[n][5] = 3;
				} else if (users[n][2] >= 50) {
					users[n][5] = 2;
				} else {
					users[n][5] = 1;
				}
				
				fs.writeFile("./dares.json", JSON.stringify(dares), function(err) {
					if (err) {
						console.log(err);
						bot.sendMessage({
							to: channelID,
							message: 'Failed to add dare, dionysis is sorry'
						});
					} else {
						bot.sendMessage({
							to: channelID,
							message: 'Your dare has been added!'
						});
					}
				});
				
				fs.writeFile("./userData.json", JSON.stringify(users), function(err) {
					if (err) {
						console.log(err);
						bot.sendMessage({
							to: channelID,
							message: 'Failed to save score, dionysis is sorry'
						});
					} else {
						// Score saved
					}
				});
				
			break;
			
			case 'highscore':
			
				first = 0;
				second = 0;
				third = 0;
				
				firstuser = '';
				seconduser = '';
				thirduser = '';
				
				for (i = 0; i < users.length; i++) {
					if (users[i][2] > first) {
						third = second;			
						second = first;
						first = users[i][2];
						thirduser = seconduser;
						seconduser = firstuser;
						firstuser = users[i][0];
					} else if (users[i][2] > second) {
						third = second;			
						second = users[i][2];
						thirduser = seconduser;
						seconduser = users[i][0];
					} else if (users[i][2] > third) {
						third = users[i][2];
						thirduser = users[i][0];
					}
				}
				
				bot.sendMessage({
					to: channelID,
					message: 'The top scorers are;\n' + first + '   ' + firstuser + '\n' + second + '   ' + seconduser + '\n' + third + '   ' + thirduser
				});
				
            break;
			
			case 'random':
			
				bot.sendMessage({
					to: channelID,
					message: 'Your number is ' + (Math.floor(Math.random() * parseInt(args[0])) + 1)
				});
				
            break;
			
			//case 'test':
			//
			//	bot.sendMessage({
			//		to: channelID,
			//		message: 'Your number is ' + (args[0][(args[0].length - 1)])
			//	});
			//	
            //break;
			
			//case 'refresh':
			//
			//
			//	if (users[n][2] >= 500) {
			//		users[n][5] = 5;
			//	} else if (users[n][2] >= 250) {
			//		users[n][5] = 4;
			//	} else if (users[n][2] >= 100) {
			//		users[n][5] = 3;
			//	} else if (users[n][2] >= 50) {
			//		users[n][5] = 2;
			//	} else {
			//		users[n][5] = 1;
			//	}
			//	
			//	users[n][4] = [];
			//	users[n][2] = 5;
			//	
			//	bot.sendMessage({
			//		to: channelID,
			//		message: 'darecount =  ' + users[n][5] + ' score = ' + users[n][2]
			//	});
			//	
			//	
            //break;
			
			case 'darelist':
			
				var obj_keys = Object.keys(dares);
				
				output = ''
				
				var start = new Date().getTime();
				
				for (i = (args[0]*10); i < Math.min((args[0]*10)+10,obj_keys.length); i++) {
					
					output = output + 'Dare ' + i.toString() + '\n' + obj_keys[i] + '\n'
					
				}
				
				bot.sendMessage({
					to: channelID,
					message: output
				});
			
			break;

			case 'remove':
			
				if(users[n][6] == 1 || users[n][6] == 2) {
					
					if (dares[message.substr(8)]) {
			
						delete dares[message.substr(8)];
						
						console.log(message.substr(8));
						
						fs.writeFile("./dares.json", JSON.stringify(dares), function(err) {
							if (err) {
								console.log(err);
								bot.sendMessage({
									to: channelID,
									message: 'Failed to remove dare, dionysis is sorry'
								});
							} else {
								bot.sendMessage({
									to: channelID,
									message: 'Your dare has been removed!\n' + message.substr(8)
								});
							}
						});
						
					} else {
						
						
						bot.sendMessage({
							to: channelID,
							message: 'Failed to find dare, dionysis is sorry'
						});
							
					}
					
				} else {
					
					bot.sendMessage({
						to: channelID,
						message: 'You do not have the permissions to do this!'
					});
					
				}
			
				
            break;
			
			case 'promote':
			
				if(users[n][6] == 2) {
			
					for (i = 0; i < users.length; i++) {
						
						if (users[i][1] == Math.floor(args[0])) {
							users[i][6] = 1;
							bot.sendMessage({
								to: channelID,
								message: users[i][0] + ' has been promoted'
							});
						}
					}
					
				
				
				} else {
					
					bot.sendMessage({
						to: channelID,
						message: 'You do not have the permissions to do this!'
					});
					
				}
				
				fs.writeFile("./userData.json", JSON.stringify(users), function(err) {
					if (err) {
						console.log(err);
						bot.sendMessage({
							to: channelID,
							message: 'Failed to save score, dionysis is sorry'
						});
					} else {
						// Score saved
					}
				});
			
			break;
				
            // Just add any case commands if you want to..
         }
     }
});