/**
 * Connection manager
 * This backend entity handles all server-related components of the extension. This includes,
 * but is not limited to:
 *    - creating keys for users to denote their session
 *    - routing events between two connected users
 *  creates socket.io connection to users that connect to the server. This socket.io
 *  can be limited to a specific namespace to allow other namespaces to have their own connection.
 */
exports.ConnectionManager = ConnectionManager;

function ConnectionManager(io, namespace)
{
  // set up variables
  this.io = io;
  this.sockets = [];
  // our random key generator function. Very state of the art.
  this.generateRandomKey = () => Math.floor((1+Math.random()) * 0x10000).toString().substring(1);
  // Setup handler for connections to our namespace
  io.of(namespace ? namespace : '/').on('connection', (socket) => this.newConnection(socket))
}

ConnectionManager.prototype.newConnection = function ConnectionManager$newConnection(socket)
{
  // Add the socket to our list of sockets, and set up message handler for it
  this.sockets.push(socket);
  socket.connectedSockets = [];
  console.log('New Connection');
  socket.on('message', (message) => this.handleSocketMessages(socket, message))
}

ConnectionManager.prototype.handleSocketMessages = function ConnectionManager$HandleSocketMessages(socket, message)
{
  // Handle all messages that our socket receives.
  switch(message.request)
  {
    case 'generateKey':
      // User has asked us to create a key for them. Generate it randomly, and save it to their
      // socket so if any other user tries to join a session with the key, we can link their sockets.
      // Then return the key to the user.
      const clientKey = this.generateRandomKey();// + this.generateRandomKey();
      socket.generatedKey = clientKey;
      socket.send({request: 'generatedKey', payload: {key: clientKey}});
      break
    case 'joinSession':
      // Allow a user to join another's session. They need to supply a key that matches
      // The most recent key generated for a different user. 
      let joinedSession = false;

      for (const otherSocket of this.sockets)
      {
        if (otherSocket.generatedKey === message.payload.key)
        {
          // User has been found. Mutually connect the sockets of the two users in a list, so messages one sends will be sent to the other
          otherSocket.connectedSockets.push(socket);
          socket.connectedSockets.push(otherSocket);
          otherSocket.send({request: 'newUser'}); // Let user know someone connected to them.
          joinedSession = true;
        }
      }
      // Let user know if they successfully joined a session or not

      if (joinedSession)
        socket.send({request: 'joinSessionSucceeded'});
      else
        socket.send({request: 'joinSessionFailed'});
      break
    case 'event':
      // route events directly from to all users connected.
      for (const otherSocket of socket.connectedSockets)
      {
        otherSocket.send(message);
      }
      break;
    case 'windowInitSize':
    case 'windowResize':
      socket.windowSize = message.payload;
      if (socket.connectedSockets.length)
      {
        if (socket.connectedSockets.every((skt) => skt.windowSize))
          updateWindowSize(socket);
      } 
      break;
    case 'close':
      if (socket.connectedSockets.length)
      {
        socket.connectedSockets.every((skt) => {
          skt.send({request: 'closed'});
          this.sockets.splice(this.sockets.indexOf(skt), 1);
        });
      }
      socket.send({request: 'closed'});
      this.sockets.splice(this.sockets.indexOf(socket), 1);
      break;
    default:
      console.warn("Got unknown message", message.request, message.payload);
  }
}

function updateWindowSize(socket)
{
  const sockets = socket.connectedSockets.concat([socket]);
  const height = Math.min(...(sockets.map(skt => skt.windowSize.height)));
  const width = Math.min(...(sockets.map(skt => skt.windowSize.width)));
  sockets.forEach(skt => {
    skt.send({request: 'windowSize', payload: {width, height}});
  });
}