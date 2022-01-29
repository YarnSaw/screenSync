/**
 * Script that get's executed in the context of the current page. Because of that,
 * we have access to the different page events, as well as the website's DOM here.
 */

// Event in browsers for mouse movement
document.onmousemove = handleMouseMove;
function handleMouseMove(event)
{
  // Send a message to the backend that the mouse has moved.
  chrome.runtime.sendMessage({request: 'event', payload: { eventName: 'mouseMove', data: {clientX: event.clientX, clientY: event.clientY}}});
}


window.onresize = handleResize
function handleResize()
{
  chrome.runtime.sendMessage({request: 'windowResize', payload: { height: window.innerHeight, width: window.innerWidth }});
}