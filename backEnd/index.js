const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ConnectionManager } = require('./connection-manager');
const port = 8080;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

server.listen(8080, () => {
  console.log(`Server started, listening on port ${port}`);
});


app.get('/', (req, res) => {
  res.send("Hello World");
});

const manager = new ConnectionManager(io);