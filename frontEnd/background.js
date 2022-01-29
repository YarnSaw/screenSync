const prodServer = 'https://yarnsawe.dev/screenSync';

var socket;
var connectedToOther = false;
var frontEndStorage = {};
var urlPreference = false; 

// Instantiate a new socket connection
function startSocket()
{
  console.trace();
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
    if (socket)
      socket.close();
    socket = false;
    connectedToOther = false;
    chrome.runtime.sendMessage({request: 'programEnded'});
    delete frontEndStorage.codeKey 
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

  if (request == 'declareURLpreference'){
    urlPreference = !urlPreference;
  }
})

// Handle responses/events coming in from the server
function handleSocketMessage(message)
{
  switch(message.request)
  {
    case 'generatedKey':
      console.log('Key:', message.payload.key);
      frontEndStorage.codeKey = message.payload.key;
      chrome.runtime.sendMessage({request: 'generatedCode', payload: {code: message.payload.key}});
      break
    case 'newUser':
      console.log("A new user joined the session");
      chrome.runtime.sendMessage({request: 'newUser'});
      // When a new user joins, we send them an event containing any and all relevant information for them to initialize their page
      // To the state of the session host
      chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
        let url = tabs[0].url;
        console.log(url)
        socket.send({request: 'event', payload: {eventName: 'newUserInfo', url}})
      });
      connectedToOther = true;
      break;
    case 'joinSessionSucceeded':
      console.log("Successfully joined a session");
      chrome.runtime.sendMessage({request: 'joinSessionSuccess'});
      connectedToOther = true;
      break;
    case 'joinSessionFailed':
      console.log("Failed to join session");
      chrome.runtime.sendMessage({request: 'joinSessionFailure'});
      break;
    case 'event':
      const ev = message.payload;
      switch(ev.eventName)
      {
        case 'newUserInfo':
          chrome.tabs.update(undefined, {url: ev.url});
          break;
        default:
          console.log("Got an unhandled event", message.payload)
      }
      break
    default:
      console.warn("Got unknown message", message.request, message.payload);
  }
}