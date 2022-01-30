function updateScroll(item)
{
  const iframe = document.getElementById('injectedIframe');
  iframe.contentWindow.scrollTo(item.scroll.xOffset, item.scroll.yOffset);
}

try
{
  chrome.storage.local.get(['scroll'], updateScroll)
}
catch (e)
{
  console.warn(e);
}