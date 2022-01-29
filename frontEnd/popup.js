// TEMP: script so we can test functionality before the full UI is done

function onLoad()
{
  const button = document.querySelector('#test');
  button.addEventListener('click', func);
  function func()
  {
    chrome.runtime.sendMessage({
      action: "test",
      source: "stuff",
    });
  }
}
window.onload = onLoad;