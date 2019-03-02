var commands = {};
var metadata = {};
var lastUpdated = {};

chrome.browserAction.setPopup({popup:"popup.html"});
chrome.runtime.onInstalled.addListener(function(info) {
    // if(info.details == "update" || info.details == "install") {
        // chrome.browserAction.setBadgeText({text:"1"});
    // }
})


chrome.browserAction.onClicked.addListener(function() {
    chrome.browserAction.setPopup({popup:"popup.html"});
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var orgKey = request.key != null ? request.key.split('!')[0] : null;
    if(request.action == 'Store Commands') {
      Object.keys(lastUpdated).forEach(function(key) {
        if(key != request.key && key.split('!')[0] == orgKey)
          delete commands[key]
          delete lastUpdated[key]
      })
      commands[request.key] = request.payload
      lastUpdated[request.key] = new Date()
      sendResponse({});
    }
    if(request.action == 'Clear Commands') {
      delete commands[request.key]
      delete lastUpdated[request.key]
      sendResponse({})
    }
    if(request.action == 'Get Commands') {
      if(commands[request.key] != null)
        sendResponse(commands[request.key])
      else
        sendResponse(null);
    }
    if(request.action == 'Get API Session ID') {
      if(request.key != null) {
        chrome.cookies.getAll({name:"sid"}, function(all) {
          all.forEach(function (c) {
            if(c.domain.includes("salesforce.com") && c.value.includes(request.key))
              sendResponse(c.value)
          })
        })
      }
      else { sendResponse(null) }
    }
    if(request.action == 'Toggle Detailed Mode') {
      var settings = localStorage.getItem('sfnav_settings')
      if(settings != null) {
        delete commands[request.key]
        delete lastUpdated[request.key]
        var sett = JSON.parse(settings)
        sett['detailedMode'] = !sett['detailedMode']
        localStorage.setItem('sfnav_settings', JSON.stringify(sett))
      }
      sendResponse({})
    }
    if(request.action == 'Get Settings') {
      var settings = localStorage.getItem('sfnav_settings');
      if(settings != null) {
        sendResponse(JSON.parse(settings));
      }
      else {
        var sett = {};
        sett['shortcut'] = 'ctrl+shift+space';
        localStorage.setItem('sfnav_settings', JSON.stringify(sett));
        sendResponse(sett);
      }
    }
    if(request.action == 'Set Settings') {
      var settings = localStorage.getItem('sfnav_settings');
      if(settings != null) {
        var sett = JSON.parse(settings);
        let payloadKeys = Object.keys(request.payload)
        for (var i = 0; i < payloadKeys.length; i++) {
          key = payloadKeys[i]
          sett[key] = request.payload[key]
        }
        localStorage.setItem('sfnav_settings', JSON.stringify(sett))
      }
      commands = lastUpdated = {}
      sendResponse({});
    }
    if(request.action == 'Store Metadata')
    {
      Object.keys(metadata).forEach(function(key) {
        if(key != request.key && key.split('!')[0] == orgKey)
          delete metadata[key];
      });
      metadata[request.key] = metadata[orgKey] = request.payload;
      sendResponse({});
    }
    if(request.action == 'Get Metadata')
    {
      if(metadata[request.key] != null)
        sendResponse(metadata[request.key]);
      else if(metadata[orgKey] != null)
        sendResponse(metadata[orgKey]);
      else
        sendResponse(null);
    }
    return true
  });