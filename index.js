const Discord = require('discord.js')
const Database = require("@replit/database")
const keepAlive = require('./server')
const axios = require('axios');

const client = new Discord.Client()
const db = new Database()

const { processRootCommand } = require('./helpers')
var cron = require('node-cron');

axios.defaults.baseURL = 'https://api.coingecko.com/api/v3';

const reduceCount = (obj) => {
  
  if(obj["repeat"]){
    const oldCount = parseInt(obj["repeat"])
    if(oldCount === 0){
      return null;
    }
    const newCount = oldCount - 1;
    obj["repeat"] = newCount;
    return obj;
  }
  return false;
}

cron.schedule('*/5 * * * *', () => {
  console.log('running a task every 5 minute');
 
  let promise = new Promise(function(resolve, reject) {
    db.get('subscriptions').then( (value) => {
      if (value){
        const users = Object.keys(value);
       
        let newSubscriptions = {};
        users.forEach(async user => {
          
          let reduceObj = reduceCount(value[user]);
          
          if(reduceObj){
            newSubscriptions[user] = reduceObj;
            // Try to fetch or else throw error
            const channel = client.channels.cache.get(reduceObj["channel"]);
            try {
              const response = await axios.get(`/simple/price?ids=${reduceObj["coinid"]}&vs_currencies=usd`)
            
              const currency_data = response.data;
              // if(Object.keys(currency_data).length > 0){
              channel.send(`Hi There, <@${user}>, Price of 1 ${reduceObj["coinid"]} is 💸💸💸 ${currency_data[reduceObj["coinid"]]["usd"]}$ 💸💸💸 | Time: ${Date().toLocaleString()}`)
              // } else {
              //   console.log("Else");
              //   delete newSubscriptions[user]
              //   console.log(newSubscriptions);
              // }
              resolve(newSubscriptions);
            } catch (err) {
              console.log(err);
              channel.send("Looks like something went wrong when tracking your coin.😞😓😥 Oops 😞😓😥.\n Please check that you have correct coinid to track. Use `!search` for getting coinid. \n Removing current track.")
              delete newSubscriptions[user]
              
              resolve(newSubscriptions);
            }
          }
        })
      }
    })
  }); // End of promise
  promise.then((val) => {
    db.set('subscriptions', val);
  })  
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Regexes
let rootRegex = new RegExp('![a-zA-z]+')
let optionsRegex = new RegExp('-[a-zA-Z]+')

client.on('message', msg => {
  
  if (msg.author.bot) return;

  if (msg.content.match(rootRegex)) {
    let command = msg.content.match(rootRegex)[0];
    processRootCommand(msg, command)
  }
  // console.log(msg.content.match(rootRegex))
});

keepAlive()
client.login(process.env.TOKEN);


