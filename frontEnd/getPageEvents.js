
document.onmousemove = handleMouseMove;
function handleMouseMove(event)
{
  chrome.runtime.sendMessage({request: 'event', payload: { eventName: 'mouseMove', data: {clientX: event.clientX, clientY: event.clientY}}});
}