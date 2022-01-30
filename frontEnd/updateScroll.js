function updateScroll(item)
{
  if (document.body.childElementCount > 1 || !document.getElementById('injectedIframe'))
    window.scrollTo(item.scroll.xOffset, item.scroll.yOffset);
  else
  {
    const iframe = document.getElementById('injectedIframe');
    iframe.contentWindow.scrollTo(item.scroll.xOffset, item.scroll.yOffset);
  }
}

try
{
  chrome.storage.local.get(['scroll'], updateScroll)
}
catch (e)
{
  console.warn(e);
}