var socket = io.connect('http://localhost:8080');
socket.on('connect', () => {console.log("connected to server")})
socket.on('message', handleSocketMessage);



chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  const request = req.request;
  if (request == 'generateCode')
    socket.send({request: 'generateKey'})
  if (request == 'endProgram')
    socket.close();
  if (request == 'joinSession')
    socket.send({request: 'joinSession', payload: {key: req.payload.code}});
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