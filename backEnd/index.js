/**
 * Set up a localhost server to be the event relay for users.
 * This has limited functionality due to how the frontend in a chrome extension works,
 * since we believe the background.js file is universal across a chrome instance, so it would
 * be hard to have multiple. Works for testing 1 way events.
 */
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