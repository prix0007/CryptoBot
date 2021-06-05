
const { 
  ping, 
  price, 
  trending, 
  search, 
  info, 
  ohlc, 
  exchange, 
  contract, 
  apid,
  ticker,
  track
} = require('./api');

const { helpCommands, about } = require('./extras');



const processRootCommand = (msg, command) => {
    const rawStr = msg.content
    const rootCmd = command.replace('!','');
    // console.log(`Root Command ${rootCmd}`)
    let restCommands = rawStr.split(" ");
    restCommands.splice(0,1)
   
    switch(rootCmd) {
      case "ping" : ping(msg); break;
      case "price": price(msg); break;
      case "search": search(msg); break;
      case "trending": trending(msg); break;
      case "info": info(msg); break;
      case "about": about(msg); break;
      case "ohlc": ohlc(msg); break;
      case "exchange": exchange(msg); break;
      case "contract": contract(msg); break;
      case "apid" : apid(msg); break;
      case "ticker": ticker(msg); break;
      case "track": track(msg); break;
      case "help" : helpCommands(msg, restCommands[0]); break;
      default: msg.channel.send("Cannot find your requested command. Try !help to know more.");
    }
}


module.exports = {
  processRootCommand
}