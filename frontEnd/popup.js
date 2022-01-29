// TEMP: script so we can test functionality before the full UI is done

function onLoad()
{
  document.querySelector('#syncEnd').addEventListener('click', () => chrome.runtime.sendMessage({request : "endProgram"}));
  document.querySelector('#generateCode').addEventListener('click', () => chrome.runtime.sendMessage({request : "generateCode"}));
  document.querySelector('#submitCode').addEventListener('click', () => {
    const code = document.querySelector('#inputCode').value;
    chrome.runtime.sendMessage({request: 'joinSession', payload: {code}});
  });
}
window.onload = onLoad;

chrome.runtime.onMessage.addListener(function (req, sender, sendResponse) {
  const request = req.request;
  if (request == 'generatedCode')
    document.write('<p>New Code<\p>');
  if (request == 'joinSessionSucceeded')
    document.write('<p>Joined a session<\p>');
  if (request == 'joinSessionSucceeded')
    document.write('<p>Failed to join a session<\p>');
  if (request == 'programEnded')
    document.write('<p>Ended the connection<\p>')
})