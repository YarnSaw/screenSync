const prodServer = 'https://yarnsawe.dev/screenSync';

var socket;
var connectedToOther = false;
var disableScroll = false;
var changingURL = false;
var frontEndStorage = {};
var statusTrack = "No Connection";
var urlPreference = false; 

// Instantiate a new socket connection
function startSocket()
{
  socket = io.connect(prodServer || 'http://localhost:8080');
  socket.on('connect', () => {console.log("connected to server")})
  socket.on('message', handleSocketMessage);
  // Seed the server with the size of our viewport, used for ensure both sides have same viewport
  chrome.tabs.executeScript(null, { file: "getInitialScreenSize.js", });
}
// Special message that happens on socket init.
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
  if (req.request === 'windowInitSize')
    socket.send({request: 'windowInitSize', payload: req.payload})
})


chrome.tabs.onUpdated.addListener((tabId, changeInfo) =>{
  if (changeInfo.url && connectedToOther && !changingURL)
    socket.send({request: 'event', payload: {eventName: 'changeURL', url: changeInfo.url}})
  if ((changeInfo.url || changingURL) && connectedToOther)
    updateSizeAndEvents();
  changingURL = false;
})


chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  const request = req.request;
  // ask server to create a new code for users to join. Create a new socketio connection if none already exist.
  if (request === 'generateCode'){
    if(!socket) {
      startSocket();
    }
    socket.send({request: 'generateKey'})
    statusTrack = "Pending";
    console.log(statusTrack)
  }
  // End the socket connection. No more connection.
  if (request === 'endProgram')
  {
    if (socket)
      socket.send({request: 'close'});
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
    if (!req.payload.eventName === 'scroll' || !disableScroll)
      socket.send(req)
  if (request === 'windowResize' && connectedToOther)
    socket.send(req);
  if (request === 'iframeCreated')
    chrome.tabs.executeScript(null, { file: "getPageEvents.js", });

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
      statusTrack = "Connected";
      console.log("A new user joined the session");
      chrome.runtime.sendMessage({request: 'joinSessionSuccess'});
      // When a new user joins, we send them an event containing any and all relevant information for them to initialize their page
      // To the state of the session host
      chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
        let url = tabs[0].url;
        socket.send({request: 'event', payload: {eventName: 'newUserInfo', url}})
      });
      connectedToOther = true;
      break;
    case 'joinSessionSucceeded':
      console.log("Successfully joined a session");
      chrome.runtime.sendMessage({request: 'joinSessionSuccess'});
      connectedToOther = true;
      statusTrack = "Connected";
      console.log(statusTrack);
      break;
    case 'joinSessionFailed':
      console.log("Failed to join session");
      chrome.runtime.sendMessage({request: 'joinSessionFailure'});
      break;
    case 'windowSize':
      chrome.storage.local.set({ windowSize: message.payload });
      updateSizeAndEvents();
      break;
    case 'closed':
      socket.close();
      socket = false;
      connectedToOther = false;
      chrome.runtime.sendMessage({request: 'programEnded'});
      delete frontEndStorage.codeKey 
      statusTrack = "No Connection";
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
      });
      break;
    case 'event':
      const ev = message.payload;
      switch(ev.eventName)
      {
        case 'newUserInfo':
          changingURL = true;
          chrome.tabs.update(undefined, {url: ev.url});
          break;
        case 'scroll':
          disableScroll = true;
          chrome.storage.local.set({ scroll: message.payload });
          chrome.tabs.executeScript(null, { file: 'updateScroll.js' });
          setTimeout(() => {disableScroll = false;}, 50) // allow scrolling again after the short delay
          break;
        case 'changeURL':
          if (urlPreference)
          {
            changingURL = true;
            chrome.tabs.update(undefined, {url: ev.url});
          }
          else
          {
            const change = confirm(`The other participant changed URL to ${ev.url}. Click OK to follow, or cancel to leave the session.`);
            if (change)
            {
              changingURL = true;
              chrome.tabs.update(undefined, {url: ev.url});
            }
            else
              chrome.runtime.sendMessage({request: 'endProgram'});
          }
          break;
        case 'mouseMove':
          chrome.storage.local.set({ mouseMovement: message.payload.data });
          chrome.tabs.executeScript(null, { file: 'updateOtherMouse.js' });
          break;
        default:
          console.log("Got an unhandled event", message.payload)
      }
      break;
    default:
      console.warn("Got unknown message", message.request, message.payload);
  }
}

function updateSizeAndEvents()
{
  // Begin executing the updateScreenSize.js. Due to how this script is being executed
  // (using chrome.tabs.executeScript), it is executed within the context of the web
  // page that the user is currently on. Because it is being executed there, it has
  // access to things that we don't here, for example mouse events.
  chrome.tabs.executeScript(null, { file: "updateScreenSize.js", });
}
// var pointerX = -1;
// var pointerY = -1;
// document.onmousemove = function(event) {
// 	pointerX = event.pageX;
// 	pointerY = event.pageY;
// }
// setInterval(pointerCheck, 1000);
// function pointerCheck() {
// 	console.log('Cursor at: '+pointerX+', '+pointerY);
// }
// mousePointerDouble ;{
//   position: absolute;
//   width: 12 ;px;
//   height: 19 ;px;
//   background: url('chrome-extension://__MSG_@@extension_id__/images/cursor.png');
//   // do not receive mouse events, otherwise it would block all mouse clicks
//   pointer-events; none;
//   z-index; 999999;
// }