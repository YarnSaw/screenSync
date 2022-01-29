var socket = io.connect('http://localhost:8080');
socket.on('connect', () => {console.log("connected to server")})
socket.on('message', handleSocketMessage);



chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  const request = req.request;
  if (request == 'generateCode')
    socket.send({request: 'generateKey'})
  if (request == 'endProgram')
  {
    socket.close();
    chrome.runtime.sendMessage({request: 'programEnded'});
  }
  if (request == 'joinSession')
    socket.send({request: 'joinSession', payload: {key: req.payload.code}});
})


function handleSocketMessage(message)
{
  switch(message.request)
  {
    case 'generatedKey':
      console.log('Key:', message.payload.key);
      chrome.runtime.sendMessage({request: 'generatedCode', payload: {code: message.payload.key}});
      break
    case 'newUser':
      chrome.runtime.sendMessage({request: 'newUser'});
      break;
    case 'joinSessionSucceeded':
      chrome.runtime.sendMessage({request: 'joinSessionSucceeded'});
      break;
    case 'joinSessionFailed':
      chrome.runtime.sendMessage({request: 'joinSessionFailed'});
      break;
    case 'event':
      console.log("Got an event", message.payload)
      break
    default:
      console.warn("Got unknown message", message.request, message.payload);
  }
}