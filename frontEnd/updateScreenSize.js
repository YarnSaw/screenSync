

function updateSize(item)
{
  const url = document.location.href;
  const iframe = document.createElement('iframe');
  iframe.width = item.windowSize.width;
  iframe.height = item.windowSize.height;
  iframe.src = url;

  const body = document.createElement('body');
  document.body = body;
  body.appendChild(iframe);
  
}


try
{
  chrome.storage.local.get(['windowSize'], updateSize)
}
catch (e)
{
  console.warn(e);
}