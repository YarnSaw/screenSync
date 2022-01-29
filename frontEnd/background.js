chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const socket = io.connect('http://localhost:8080');
  socket.on('connect', () => {console.log("connected")} )
})