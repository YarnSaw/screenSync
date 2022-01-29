var socket = io.connect('http://localhost:8080');
socket.on('connect', () => {console.log("connected to server")})
socket.on('message', handleSocketMessage);



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == 'test')
    socket.send({request: 'generateKey'})

})


function handleSocketMessage(message)
{
  switch(message.request)
  {
    case 'generatedKey':
      console.log('got a key:', message.payload.key);
      // Need to actually store the key at some point
      break
    case 'event':
      console.log("Got an event", message.payload)
      break
    default:
      console.warn("Got unknown message", message.request, message.payload);
  }
}