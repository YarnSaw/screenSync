

function updateSize(item)
{
  if (document.body.childElementCount > 1 || !document.getElementById('injectedIframe'))
  {
    const url = document.location.href;
    const iframe = document.createElement('iframe');
    iframe.width = item.windowSize.width;
    iframe.height = item.windowSize.height;
    iframe.src = url;
    iframe.id = "injectedIframe";
  
    const body = document.createElement('body');
    document.body = body;
    body.appendChild(iframe);
    chrome.runtime.sendMessage({request: 'iframeCreated'});
  }
  else
  {
    const iframe = document.getElementById('injectedIframe');
    iframe.width = item.windowSize.width;
    iframe.height = item.windowSize.height;
  }
  
}


try
{
  chrome.storage.local.get(['windowSize'], updateSize)
}
catch (e)
{
  console.warn(e);
}