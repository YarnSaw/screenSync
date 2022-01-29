/**
 * Set up event listeners for various key events when the popup is loaded
 */
function onLoad()
{
  // Set up event listeners to the various buttons that will send messages via chrome runtime to other scripts.
  document.querySelector('#syncEnd').addEventListener('click', () => chrome.runtime.sendMessage({request : "endProgram"}));
  document.querySelector('#generateCode').addEventListener('click', () => chrome.runtime.sendMessage({request : "generateCode"}));
  document.querySelector('#submitCode').addEventListener('click', () => {
    const code = document.querySelector('#inputCode').value;
    chrome.runtime.sendMessage({request: 'joinSession', payload: {code}});
  });

  // Begin executing the getPageEvents.js. Due to how this script is being executed
  // (using chrome.tabs.executeScript), it is executed within the context of the web
  // page that the user is currently on. Because it is being executed there, it has
  // access to things that we don't here, for example mouse events.
  chrome.tabs.executeScript(null, {
    file: "getPageEvents.js",
  });
}

// Built into browsers, when the window loads it calls the `window.onload`, if it exists.
window.onload = onLoad;

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  const request = req.request;
  // Handle all the possible events from the backend to the popup that need to be displayed.
  if (request == 'generatedCode')
    document.querySelector('#test').hidden = false;
  if (request == 'joinSessionSucceeded')
    document.write('<p>Joined a session<\p>');
  if (request == 'joinSessionSucceeded')
    document.write('<p>Failed to join a session<\p>');
  if (request == 'programEnded')
    document.querySelector('#test').hidden = true;
})