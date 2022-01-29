exports.ConnectionManager = ConnectionManager;

function ConnectionManager(io, namespace)
{
  this.io = io;
  this.sockets = [];
  this.generateRandomKey = () => Math.floor((1+Math.random()) * 0x10000).toString().substring(1);
  io.of(namespace ? namespace : '/').on('connection', (socket) => this.newConnection(socket))
}

ConnectionManager.prototype.newConnection = function ConnectionManager$newConnection(socket)
{
  this.sockets.push(socket);
  socket.connectedSockets = [];
  console.log('New Connection');
  socket.on('message', (message) => this.handleSocketMessages(socket, message))
}

ConnectionManager.prototype.handleSocketMessages = function ConnectionManager$HandleSocketMessages(socket, message)
{
  switch(message.request)
  {
    case 'generateKey':
      const clientKey = this.generateRandomKey() + this.generateRandomKey();
      socket.generatedKey = clientKey;
      socket.send({request: 'generatedKey', payload: {key: clientKey}});
      break
    case 'joinSession':
      let joinedSession = false;

      for (const otherSocket of this.sockets)
      {
        if (otherSocket.generatedKey === message.payload.key)
        {
          otherSocket.connectedSockets.push(socket);
          socket.connectedSockets.push(otherSocket);
          otherSocket.send({request: 'newUser'});
          joinedSession = true;
        }
        if (joinedSession)
          socket.send({request: 'joinSessionSucceeded'});
        else
          socket.send({request: 'joinSessionFailed'});
      }
      // Probably send response to both sides about success/fail
      break
    case 'event':
      for (const otherSocket of socket.connectedSockets)
      {
        otherSocket.send(message);
      }
      break;
    default:
      console.warn("Got unknown message", message.request, message.payload);
  }
}