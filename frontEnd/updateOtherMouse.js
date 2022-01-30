function updateOtherMouse(item)
{
  // item.mouseMove.clientX -> the x coord of the other mouse
  // item.mouseMove.clientY -> the y coord of the other mouse
  let otherMouse = document.getElementById('otherUserMouse');
  if (!otherMouse)
  {
    otherMouse = document.createElement('div');
    otherMouse.style.backgroundColor = 'red';
    otherMouse.style.borderRadius = '50%';
    otherMouse.style.width = '30px';
    otherMouse.style.height = '30px';
    otherMouse.style.zIndex = '10';
    otherMouse.style.position = 'absolute';
    otherMouse.id = 'otherUserMouse';
    document.body.insertBefore(otherMouse, document.body.firstChild);
  }
  otherMouse.style.top = item.mouseMovement.clientY+'px';
  otherMouse.style.left = item.mouseMovement.clientX+'px';
}

try
{
  chrome.storage.local.get(['mouseMovement'], updateOtherMouse)
}
catch (e)
{
  console.warn(e);
}