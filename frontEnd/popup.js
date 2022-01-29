// TEMP: script so we can test functionality before the full UI is done

function onLoad()
{
  const button = document.querySelector('#syncEnd');
  button.addEventListener('click', func);
  function func()
  {
    chrome.runtime.sendMessage({
      request : "endProgram"
    });
  }
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