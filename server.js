const express = require('express')
const path = require('path');

const server = express()

server.use(express.static(__dirname + '/public'));


server.all('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

function keepAlive() {
  server.listen(3000, () => {
    console.log("Server is ready.")
  })
}

module.exports = keepAlive