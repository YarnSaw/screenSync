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