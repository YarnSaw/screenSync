const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const port = 8080;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

server.listen(8080, () => {
  console.log(`Server started, listening on port ${port}`);
});


app.get('/', (requ, res) => {
  res.send("Hello World");
});

io.on('connection', (socket) => {
  console.log('got a new user connected');
});