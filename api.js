const axios = require('axios');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const Database = require("@replit/database")
const QuickChart = require('quickchart-js');
const getSymbolFromCurrency = require('currency-symbol-map')
const { fuzzySearch } = require('./extras');

const db = new Database()


axios.defaults.baseURL = 'https://api.coingecko.com/api/v3';

const ping = async (msg) => {
  try {
    const response = await axios.get('/ping');
    msg.channel.send(`Eveything is working fine here. ${response.data['gecko_says']}`)
  } catch (error) {
    msg.channel.send("Looks like something's wrong on the other side. ☹️☹️☹️");
  }
}

const price = async (msg) => {

  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split(" ")
  arrayCommands.splice(0,1)

  // Check for command arguments
  if (arrayCommands.length !== 2) {
    msg.channel.send("Send this command as !price `currencyid` `vs_currency` : vs_curreny will be usd, eur, etc.")
    return 
  }

  // Try to fetch or else throw error
  try {
    const response = await axios.get(`/simple/price?ids=${arrayCommands[0]}&vs_currencies=${arrayCommands[1]}`)
    msg.channel.send(`Price of 1 ${arrayCommands[0]} is 💸💸💸 ${response.data[arrayCommands[0]][arrayCommands[1]]} ${arrayCommands[1].toUpperCase()} 💸💸💸`)
  } catch {
    msg.channel.send("Looks like something went wrong.\nDo try !help for help. \nMake sure you are using command as !price `coinid` `currency`")
  }
}

const search = async (msg) => {

  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split(" ")
  arrayCommands.splice(0,1)

  if (arrayCommands.length > 2 || arrayCommands[0].length === 0) {
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command as `!search optional_flag some_string`. Make sure search string is atleast 3 characters for better results. Use flag -e to search for exchanges.");
    return
  }

  const embed = new MessageEmbed()
      .setTitle(`Search Results`)
      .setColor(0x228B22)

  // Check if flag is provided
  try {
    if(arrayCommands[0].trim().match(/-[e|E]/)){
    
        db.get('exchanges').then(async (value) => {
          if(!value) {
            const response = await axios.get('/exchanges/list');
            db.set('exchanges', response.data)
            return response.data
          } else {
            return value
          }
        }).then(exchangeslist => {
          const options = {
            // isCaseSensitive: false,
            // includeScore: false,
            // shouldSort: true,
            // includeMatches: false,
            // findAllMatches: false,
            minMatchCharLength: 2,
            // location: 0,
            // threshold: 0.6,
            // distance: 100,
            // useExtendedSearch: false,
            // ignoreLocation: false,
            // ignoreFieldNorm: false,
            keys: [
              "id",
              "name"
            ]
          };

          const results = fuzzySearch(exchangeslist, options, arrayCommands[1].trim());

          if (results.length === 0) {
            embed.setDescription("Oops! Looks like no results found. 🤦‍♂️🤦 Try Again!");
            msg.channel.send(embed);
            return;
          }

          // Keep only first 5 results
          results.splice(5, results.length - 5)
        
          let messageStr = "";
          results.forEach(result => {
            messageStr += `\n Exchange Name: ${result.item.name} | Exchange Id: \`${result.item.id}\``
          })

          embed.setDescription(messageStr)
          msg.channel.send(embed);
        });
    } else {
        db.get('coinlist').then(async (value) => {
          if(!value) {
            const response = await axios.get('/coins/list');
            db.set('coinlist', response.data)
            return response.data
          } else {
            return value
          }
        }).then(coinlist => {
          const options = {
            // isCaseSensitive: false,
            // includeScore: false,
            // shouldSort: true,
            // includeMatches: false,
            // findAllMatches: false,
            minMatchCharLength: 3,
            // location: 0,
            // threshold: 0.6,
            // distance: 100,
            // useExtendedSearch: false,
            // ignoreLocation: false,
            // ignoreFieldNorm: false,
            keys: [
              "name",
              "symbol"
            ]
          };

          const results = fuzzySearch(coinlist, options, arrayCommands[0].trim());

          if (results.length === 0) {
            embed.setDescription("Oops! Looks like no results found. 🤦‍♂️🤦 Try Again!");
            msg.channel.send(embed);
            return;
          }

          // Keep only first 5 results
          results.splice(5, results.length - 5)
        
          let messageStr = "";
          results.forEach(result => {
            messageStr += `\n Coin: ${result.item.name} (${result.item.symbol}) | CoinId: \`${result.item.id}\``
          })

          embed.setDescription(messageStr)
          msg.channel.send(embed);

      });
    }
  } catch {
    msg.channel.send("Looks like something went wrong on this side.😫😫😫 Check back in few minutes, I will try to fix it. Make sure command is given as `!search optional_flag search_phrase`. Flag Available - |-e|")
  }
}

const trending = async (msg) => {
  try {
    const response = await axios.get('/search/trending');
    const topTrending = response.data.coins;

    const rawStr= msg.content;
    const splittedStr = rawStr.split(" ");
    splittedStr.splice(0,1)
    if(splittedStr.length > 1){
      msg.channel.send("Only one arg. is optional (limit: integer)")
      return
    }
    let limit = 0;
    if(splittedStr[0]){
      try {
        limit = parseInt(splittedStr[0])
      } catch {
        msg.channel.send("Error in parsing limit. Sending all 7.")
      }
    } 

    if (limit > 0 && limit <= 7){
      topTrending.splice(limit, 7-limit)
    }

    topTrending.forEach(({item}) => {
      const embed = new MessageEmbed()
        .setTitle(`Trending Rank: ${item['score'] + 1}`)
        .setColor(0xff0000)
        .addField("Coin-Id", item['id'], true)
        .setImage(item['small'])
        .setDescription(`${item['name']} (${item['symbol']})`)
        .setFooter(`Market Cap Rank: ${item['market_cap_rank']}`);
        // Send the embed to the same channel as the message
      msg.channel.send(embed);
    })
  } catch {
    msg.channel.send("Looks like something went wrong.\nDo try !help for help. \nMake sure you are using command as !trending `limit(optional max.-7)`")
  }
}

const info = async (msg) => {
  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split(" ")
  arrayCommands.splice(0,1)

  if (arrayCommands.length > 2 || arrayCommands.length === 0) {
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command as `!info coinid lang(optional)`. Make sure to get coinid from `!search` command");
    return
  }

  try {
    const response = await axios.get(`/coins/${arrayCommands[0]}`);
    const coin = response.data;

    const embed = new MessageEmbed()
        .setTitle(`${coin['name']} (${coin['symbol']}) - ${coin['localization'][arrayCommands[1] || 'en']}`)
        .setColor(0xFFA500)
        .addField("Coin-Id", coin['id'], true)
        .addField("Hashing Algorithm", coin['hashing_algorithm'], true)
        .setImage(coin['image']['small'])
        .setURL(coin['links']['homepage'][0])
        .setDescription(`${coin['description'][arrayCommands[1] || 'en'].substring(0,400) + " ... click on link to know more."}`)
        .setFooter(`Market Cap Rank: ${coin['market_cap_rank']} | Price - ${coin['market_data']['current_price']['usd']} $`);
        // Send the embed to the same channel as the message
      msg.channel.send(embed);

  } catch {
    msg.channel.send("Looks like something went wrong on this side.😫😫😫 Check back in few minutes, I will try to fix it. Make sure command is given as `!info coinid en(optional)`. Make sure to get coinid from `!search` command.")
  }
}



const ohlc = async (msg) => {
  
  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split(" ")
  arrayCommands.splice(0,1)

  if (arrayCommands.length > 3 || arrayCommands.length === 0) {
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command as `!ohlc coinid vs_currency days`. Make sure to get coinid from `!search` command and vs_currency as usd, eur, etc.");
    return
  }

  console.log(arrayCommands);

  try {
    msg.channel.send("Your Candle’s body: \n 1 - 2 days: 30 minutes \n 3 - 30 days: 4 hours \n 31 and before: 4 days");

    const url = `/coins/${arrayCommands[0]}/ohlc`;
    console.log(url);

    const response = await axios.get(url, {
      params: {
        vs_currency: arrayCommands[1],
        days: arrayCommands[2]
      }
    })
    const rawData = response.data;
    let min = 10000000000;
    let max = 0;
    const formattedData = rawData.map((data) => {
      if(min > data[3]){
        min = data[3]
      }
      if(max < data[2]){
        max = data[2]
      }
      return {
        "date":  new Date(data[0]).toLocaleDateString()+" | "+ new Date(data[0]).toLocaleTimeString(),
        "open_close": [data[1],data[4]],
        "high_low": [data[2], data[3]],
      }
    });
    const symbol = getSymbolFromCurrency(arrayCommands[1].toUpperCase())
    console.log(symbol);

    const myChart = new QuickChart();
      myChart
        .setConfig({
          type: 'bar',
          data: {
            labels: formattedData.map(data => data["date"]),
            datasets: [
              {
                label: `Open Close`,
                data: formattedData.map(data => data["open_close"]),
              },
              {
                type: 'line',
                fill: false, 
                label: 'High',
                borderColor: "#55d503",
                borderWidth: 1,
                data: formattedData.map(data => data["high_low"][0])
              },
              {
                type: 'line',
                fill: false, 
                label: 'Low',
                 borderColor: "#cc0c0c",
                borderWidth: 1,
                data: formattedData.map(data => data["high_low"][1])
              },
            ],
          },
          options: {
            responsive: true,
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: `OHLC Data for ${arrayCommands[0].toUpperCase()}. (${arrayCommands[1].toUpperCase()}) | ${arrayCommands[2]} Days`,
            },
           "scales": {
              "xAxes": [{
                "gridLines": {
                  "display": true
                },
              }],
              "yAxes": [{
                "gridLines": {
                  "display": true
                },
                "min": min,
                "max": max,
                
                "ticks": {
                  "stepSize": Math.floor((max-min)/10),
                  callback: (val) => {
                    return val.toLocaleString();
                  },
                },
              }]
            },
          },
        })
      .setWidth(1920)
      .setHeight(1080)
      .setBackgroundColor('white'); 

    // // Print the chart URL
      console.log(await myChart.getShortUrl())

    const attachment = new MessageEmbed()
      .setTitle(`📊📈📉 OHLC for ${arrayCommands[0]} of past ${arrayCommands[2]} days. (${arrayCommands[1].toUpperCase()}) 📊📈📉`)
      .setImage(await myChart.getShortUrl())

    msg.channel.send(attachment)

  } catch (err){
    msg.channel.send("Looks like something went wrong here.😓😓😓 Please try again and check you input commands Supported days are (1/7/14/30/90/180/365). !help for help.")
  }

}

const exchange = (msg) => {
  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split("!exchange")
  arrayCommands.splice(0,1)

  if (arrayCommands.length > 1 || arrayCommands[0].length === 0) {
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command as `!exchange vs_currency`. Make sure vs_currency is exact 3 characters e.g usd, ltc, etc.");
    return
  }
  try {
    db.get('exchange_rate_btc').then(async (value) => {
      if(!value) {
        const response = await axios.get('/exchange_rates');
        db.set('exchange_rate_btc', response.data['rates'])
        return response.data['rates']
      } else {
        return value
      }
    }).then((rates) => {
      const keys = Object.keys(rates);
      if(keys.includes(arrayCommands[0].trim())) {
        const value = rates[arrayCommands[0].trim()];
        
        let value_keys = Object.keys(value);
        
        const embed = new MessageEmbed();
        embed.setTitle("Exchange Rate for a Bitcoin")
        value_keys.forEach(key => {
          embed.addField(key, value[key], true)
        });
        embed.setColor('#14d1fe')
        msg.channel.send(embed);
      } else {
        let keys_string = "Looks like currency you provided isn't available. Here are all the current available vs_currency";
        keys.forEach(key => {
          keys_string += `\`${key}\`,`;
        })
        msg.channel.send(keys_string)
      }
    })
  } catch {
      msg.channel.send("Looks like something went wrong on this side.😫😫😫 Check back in few minutes, I will try to fix it. Make sure command is given as `!exhange vs_currency`.")
  }
}

const contract = async (msg) => {
  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split(" ")
  arrayCommands.splice(0,1)

  if (arrayCommands.length !== 2) {
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command as `!contract asset_platform_id contract_address`. Make sure to search for you asset_platform_id from `!apid search_string`");
    return
  }

  try {
    const response = await axios.get(`/coins/${arrayCommands[0]}/contract/${arrayCommands[1]}`);

    const cdata = response.data;
    const embed = new MessageEmbed()
      .setTitle(cdata['name'])
      .addField("Contract ID", cdata['id'])
      .addField("Contract Symbol", cdata['symbol'])
      .addField("Contract Asset Platform ID", cdata['asset_platform_id'])
      .addField("Available Platforms", Object.keys(cdata['platforms']).join(","))
      .addField("Contract Address", cdata["contract_address"])
      .addField("Market Cap. Rank", cdata["market_cap_rank"])
      .setFooter(`Current Price: ${cdata["market_data"]["current_price"]["usd"]} $`)
      .setURL(cdata["links"]["homepage"][0])
      .setImage(cdata["image"]["small"])

      msg.channel.send(embed);

  } catch (err) {
    console.log(err);
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command as `!contract asset_platform_id contract_address`. Make sure to search for you asset_platform_id from `!apid search_string`");
  }

}

const apid = (msg) => {
  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split(" ")
  arrayCommands.splice(0,1)

  if (arrayCommands.length !== 1 || !arrayCommands[0]) {
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command as `!apid search_string`.");
    return
  }

  try {
    db.get('asset_platforms').then(async (value) => {
      if(!value) {
        const response = await axios.get('/asset_platforms');
        db.set('asset_platforms', response.data)
        return response.data
      } else {
        return value
      }
    }).then(assetsList => {
      const options = {
        minMatchCharLength: 2,
        keys: [
          "id",
          "name"
        ]
      };

      const results = fuzzySearch(assetsList, options, arrayCommands[0].trim());

      if (results.length === 0) {
        embed.setDescription("Oops! Looks like no results found. 🤦‍♂️🤦 Try Again!");
        msg.channel.send(embed);
        return;
      }

      // Keep only first 5 results
      results.splice(5, results.length - 5)
    
      let messageStr = "";
      results.forEach(result => {
        messageStr += `\n Platform Name: ${result.item.name} | Platform Id: \`${result.item.id}\` | Chain Identifier: \`${result.item["chain_identifier"]}\``
      })

      const embed = new MessageEmbed()
        .setTitle("Search Results")
        .setDescription(messageStr)
        .setColor("#3a57c5")
      msg.channel.send(embed);
    });
  } catch {
    msg.channel.send("Looks like something went wrong on this side.😫😫😫 Check back in few minutes, I will try to fix it. Make sure command is given as `!apid search_phrase`")
  }
}


const ticker = async (msg) => {
  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split(" ")
  arrayCommands.splice(0,1)

  if (arrayCommands.length !== 1 || !arrayCommands[0]) {
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command as `!ticker coinid`. Make sure to get coin id from `!search serach_string`");
    return
  }

  try {
    const response = await axios.get(`/coins/${arrayCommands[0].trim()}/tickers`);
    const tickers = response.data["tickers"];
    tickers.splice(10);
    const embed = new MessageEmbed()
      .setTitle(`${response.data["name"]}`);
    
    tickers.forEach(ticker => {
      embed.addField(ticker["market"]["name"], `Base: ${ticker["base"]} (${ticker["coin_id"]}) <=> Target: ${ticker["target"]} (${ticker["target_coin_id"]}) | Market: ${ticker["market"]["name"]} \n TradeUrl: ${ticker["trade_url"]} \n`)
    })
    embed.setDescription("Showing only first 10 Results due to Discord Limitations.")
    embed.setColor("#0adb92")
    msg.channel.send(embed);

  } catch (err) {
    msg.channel.send("Looks like something went wrong on this side.😫😫😫 Check back in few minutes, I will try to fix it. Make sure command is given as `!ticker coinid`")
  }
}

const track = (msg) => {
  const channelId = msg.channel.id;
  const userId = msg.author.id;
  console.log(channelId);
  console.log(msg.author);

  const rawStrCmd = msg.content;
  
  const arrayCommands = rawStrCmd.split(" ")
  arrayCommands.splice(0,1)

  if (arrayCommands.length !== 2) {
    msg.channel.send("Oops 🤦‍♂️! Something went wrong again. Try this command  as `!track coinid times`. Make sure to get coin id from `!search serach_string`");
    return
  }

  try {
    db.get('subscriptions').then(value => {
      if(!value || Object.keys(value).length == 0){
        let subscriptions = {};
        subscriptions[userId] = {
          'channel': channelId,
          'coinid' : arrayCommands[0].trim(),
          'repeat' : arrayCommands[1]
        }
        console.log("No subscriptions Found")
        console.log(subscriptions);
        db.set('subscriptions', subscriptions);
        
      } else {
        if(value[userId]){
          msg.channel.send("You can track atmost 1 Coin For now 🥲. Stay tuned for next version 💪. Overriding Previous Coin Track 🍀🍀.")
        }
        value[userId] = {
          'channel': channelId,
          'coinid' : arrayCommands[0].trim(),
          'repeat' : arrayCommands[1]
        }
        db.set('subscriptions', value);
      }
      msg.channel.send(`Thanks for tracking a coin. I will keep you notifying about coin price every ⏱️⏱️ five ⏱️⏱️ minutes upto ${arrayCommands[1]} time.`)
    })
  } catch {
    msg.channel.send("Oh Snap!😞😞 Looks like I can't track your request. Please check back again in a bit. Use !help for help.")
  }
  
}


module.exports = {
  ping,
  price,
  search,
  trending,
  info,
  ohlc,
  exchange,
  contract,
  apid,
  ticker,
  track
}