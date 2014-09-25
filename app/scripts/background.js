var commands = {};
var metadata = {};
chrome.browserAction.setPopup({popup:"popup.html"});
chrome.runtime.onInstalled.addListener(function(info) {
    // if(info.details == "update" || info.details == "install") {
        // chrome.browserAction.setBadgeText({text:"1"});
    // }
})


chrome.browserAction.onClicked.addListener(function() {
    chrome.browserAction.setPopup({popup:"popup.html"});
});

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.action == 'Store Commands')
    {
      commands[request.key] = commands[request.key.split('!')[0]] = request.payload;
      sendResponse({});
    }
    if(request.action == 'Get Commands')
    {
      if(commands[request.key] != null)
        sendResponse(commands[request.key]);
      else if(commands[request.key.split('!')[0]] != null)
        sendResponse(commands[request.key.split('!')[0]]);
      else
        sendResponse(null);
    }
    if(request.action == 'Get Settings')
    {
      var settings = localStorage.getItem('sfnav_settings');
      console.log('settings: ' + settings);
      if(settings != null)
      {
        sendResponse(JSON.parse(settings));
      }
      else
      {
        var sett = {};
        sett['shortcut'] = 'ctrl+shift+space';
        localStorage.setItem('sfnav_settings', JSON.stringify(sett));
        sendResponse(sett);
      }
    }
    if(request.action == 'Set Settings')
    {
      var settings = localStorage.getItem('sfnav_settings');
      if(settings != null)
      {
        var sett = JSON.parse(settings);
        sett[request.key] = request.payload;
        localStorage.setItem('sfnav_settings', JSON.stringify(sett));
      }
      sendResponse({});
    }
    if(request.action == 'Store Metadata')
    {
      metadata[request.key] = metadata[request.key.split('!')[0]] = request.payload;
      sendResponse({});
    }
    if(request.action == 'Get Metadata')
    {
      if(metadata[request.key] != null)
        sendResponse(metadata[request.key]);
      else if(metadata[request.key.split('!')[0]] != null)
        sendResponse(metadata[request.key.split('!')[0]]);
      else
        sendResponse(null);
    }
  });
