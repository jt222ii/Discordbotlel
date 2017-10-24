let Discord = require('discord.io');
let logger = require('winston');
let auth = require('./auth.json');
let log = require('./dajmLog.json')
let Promise = require('promise');

const fs = require('fs');
const co = require('co');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

let bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready',  (evt) => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', (user, userID, channelID, message, evt) => {
    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            case 'dajm':
                let dajmEntry = {
                    user: user,
                    date: new Date().toISOString()
                }
                log.push(dajmEntry);
                fs.writeFile('dajmLog.json', JSON.stringify(log), (err) => {console.log(err);});
                bot.sendMessage({
                    to: channelID,
                    message: '+1 dajm(detta meddelandet ska bytas ut och alla !dajm ska tas bort men registreras)'
                });
            break;
            case 'dajmcount':
                bot.sendMessage({
                    to: channelID,
                    message: 'DTC: '+log.length
                }); 
            break;
            case 'listdajms':
                let messagesToPrint = 55;
                bot.sendMessage({
                    to: userID,
                    message: 'Printing the last '+messagesToPrint+' messages!'
                }); 
                sendDajmList(log.slice().reverse(), userID, channelID, messagesToPrint);
            break;
         }
     }
});

const sendDajmList = (entries, userID, channelID, maxMessages) => {
        let maxMessageLength = 43*25;//one entry is 43 characters. 
        let mess = '```';
        while(mess.length+86 < maxMessageLength && entries.length > 0){
            let entry = entries.shift();
            mess += 'User: ' + entry.user + ' Date: ' + entry.date + '\n';
        }
        mess += '```';
        bot.sendMessage({
            to: userID,
            message: mess
        }); 
        if(entries.length != 0)
        {
            sendDajmList(entries, userID, channelID, maxMessages);
        }
}