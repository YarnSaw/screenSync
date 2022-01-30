/**
 * Script that get's executed in the context of the current page. Because of that,
 * we have access to the different page events, as well as the website's DOM here.
 */

// This code should only ever execute in the 'else' segment, but the if is here for security, if something
// unexpected occurs. It's the "base case".
if (document.body.childElementCount > 1 || !document.getElementById('injectedIframe'))
{
  document.onmousemove = handleMouseMove;
  function handleMouseMove(event)
  {
    chrome.runtime.sendMessage({request: 'event', payload: { eventName: 'mouseMove', data: {clientX: event.clientX, clientY: event.clientY}}});
  }
  
  window.onscroll = handleScrolling
  function handleScrolling()
  {
    chrome.runtime.sendMessage({request: 'event', payload: { eventName: 'scroll', xOffset: window.pageXOffset, yOffset: window.pageYOffset }});
  }
}
else
{
  const iframe = document.getElementById('injectedIframe');
  iframe.contentWindow.onmousemove = handleMouseMove;
  function handleMouseMove(event)
  {
    chrome.runtime.sendMessage({request: 'event', payload: { eventName: 'mouseMove', data: {clientX: event.clientX, clientY: event.clientY}}});
  }
  
  iframe.contentWindow.onscroll = handleScrolling
  function handleScrolling()
  {
    chrome.runtime.sendMessage({request: 'event', payload: { eventName: 'scroll', xOffset: iframe.contentWindow.pageXOffset, yOffset: iframe.contentWindow.pageYOffset }});
  }
}

window.onresize = handleResize
function handleResize()
{
  chrome.runtime.sendMessage({request: 'windowResize', payload: { height: window.innerHeight, width: window.innerWidth }});
}