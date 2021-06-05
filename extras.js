const { MessageAttachment, MessageEmbed } = require('discord.js');
const Fuse = require('fuse.js')


const helpMessage = "This is a CryptoBot, Helps you to keep updated with the crypto     world. \n 1. Use !`rootCommand` to invoke CryptoBot \n 2. Root Commands Available - `!ping`, `!price` , `!search` (helps you find id for matching string you supply, Use flag -e to search for exchanges.) , `!trending` (Get Trending coins), `!info` (Get information about coin), `!about` (Get info about the bot), `!ohlc` (Gives you Open Close High and Low for a coin in past amount of days. Supported Days are (1/7/14/30/90/180/365)), `!exchange vs_currency` (Give you exchange rate of a Bitcoin), `!apid search_string` (Helps you find asset platform ids for contracts), `!contract asset_platform_id contract_address` (Gives you information about the specified contract), `!ticker coin_id` (Give you information about tickers for a specific coin), `!track coinid repeat` (You can track the price of a coin for specific amount of times which will notify you every 5 minutes) \n 3. To get help on any root Commands write `!help 'rootCommand'`"

const helpCommands = (msg, command) => {
  switch(command) {
    case "ping" : msg.channel.send("This will let you know about network connectivity."); break;
    case "trending": msg.channel.send("This will let you know current trending crypto coins in market. Usage: `!trending limit(integer)(optional max. 7)`"); break;
    case "price": msg.channel.send("This will help you know current price of cyptocurreny in a vs_curreny manner. Use !search `phrase` to search for coinid. Usage e.g`!price bitcoin usd`"); break;
    case "search": msg.channel.send("This command will help you to get coinid which can be used later for all commands specific to coins. Use flag -e to search for exchanges. Usage: `!search optional_flag search_string`"); break;
    case "info": msg.channel.send("This will get you info for any specific coinid. Usage: `!info coinid lang(optional)`"); break;
    case "ohlc": msg.channel.send("This will help you get a graph of OHLC for a coin in past amount of days (1/7/14/30/90/180/365). Usage: `!ohlc coinid vs_curreny days`"); break;
    case "lang": msg.channel.send("Lang is a two character code for language. E.g en->English, etc."); break;
    case "about": msg.channel.send("Tells you about me. 🥲🥲"); break;
    case "exchange": msg.channel.send("Gives you exchange rate for one Bitcoin 🤑💰. Usage: `!exchange vs_currency`"); break;
    case "apid": msg.channel.send("Helps you find asset platform id for contracts and chains. Usage: `!apid search_string`"); break;
    case "contract": msg.channel.send("Give you information about the specific contract address on a platform. Usage: `!contract asset_platform_id contract_address`"); break;
    case "ticker": msg.channel.send("Give you information about the Available Tickers on Different Platform. Usage: `!ticker coin_id`"); break;
    case "track" : msg.channel.send("You can track the price of a coin for specific amount of times which will notify you every 5 minutes. Usage: `!track coin_id repeat(integer)`"); break;
    default: msg.channel.send(helpMessage);
  }
}

const about = (msg) => {
  const embed = new MessageEmbed()
    .setTitle(`🦄💹 Crypto Bot`)
    .setColor(0x8A2BE2)
    .addField("Supercharged By,", "CoinGecko API | Replit")
    .setDescription("This is a discord bot which helps you keep updated with the cryptocurreny world.\n Try `!ping` to check if it's working. `!help` for help \n Developed and maintained by - prix0007@github")

  msg.channel.send(embed);
  
}

const fuzzySearch = (list, options, search_string) => {
    const fuse = new Fuse(list, options);
    return  fuse.search(search_string)
}

module.exports = {
  helpCommands,
  about,
  fuzzySearch
}