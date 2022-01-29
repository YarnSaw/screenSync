const prodServer = 'https://yarnsawe.dev/screenSync';

var socket;
var connectedToOther = false;

// Instantiate a new socket connection
function startSocket()
{
  socket = io.connect(prodServer || 'http://localhost:8080');
  socket.on('connect', () => {console.log("connected to server")})
  socket.on('message', handleSocketMessage);
}


chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  const request = req.request;
  // ask server to create a new code for users to join. Create a new socketio connection if none already exist.
  if (request === 'generateCode'){
    if(!socket) {
      startSocket();
    }
    socket.send({request: 'generateKey'})
  }
  // End the socket connection. No more connection.
  if (request === 'endProgram')
  {
    socket.close();
    socket = false;
    connectedToOther = false;
    chrome.runtime.sendMessage({request: 'programEnded'});
  }
  // Join someone else's session. Create a new socketio connection if non exist.
  if (request === 'joinSession'){
    if (!socket){
      startSocket();
    }
    socket.send({request: 'joinSession', payload: {key: req.payload.code}});
  }
  // Events to go to connected users.
  if (request === 'event' && connectedToOther)
    socket.send(req);
})

// Handle responses/events coming in from the server
function handleSocketMessage(message)
{
  switch(message.request)
  {
    case 'generatedKey':
      console.log('Key:', message.payload.key);
      chrome.runtime.sendMessage({request: 'generatedCode', payload: {code: message.payload.key}});
      break
    case 'newUser':
      console.log("A new user joined the session");
      chrome.runtime.sendMessage({request: 'newUser'});
      connectedToOther = true;
      break;
    case 'joinSessionSucceeded':
      console.log("Successfully joined a session");
      chrome.runtime.sendMessage({request: 'joinSessionSucceeded'});
      connectedToOther = true;
      break;
    case 'joinSessionFailed':
      console.log("Failed to join session");
      chrome.runtime.sendMessage({request: 'joinSessionFailed'});
      break;
    case 'event':
      console.log("Got an event", message.payload)
      break
    default:
      console.warn("Got unknown message", message.request, message.payload);
  }
}