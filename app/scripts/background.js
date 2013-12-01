
// toggle extension
chrome.browserAction.onClicked.addListener(function(tab) {
            chrome.tabs.getSelected(null, function(tab) {
              chrome.tabs.sendMessage(tab.id, {name: 'toggle', tabId:tab.id});
            });
        });
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == 'executeScripts')
    {
        chrome.tabs.executeScript(sender.tab.id, {file: 'scripts/util.js'},function(a) { 
          chrome.tabs.executeScript(sender.tab.id, {file: 'bower_components/angular/angular.js'},function(a) { 
            chrome.tabs.executeScript(sender.tab.id, {file: 'scripts/app/app.js'}, function(a) { 
              chrome.tabs.executeScript(sender.tab.id, {file: 'scripts/app/services.js'},function(a) { 
                chrome.tabs.executeScript(sender.tab.id, {file: 'scripts/app/controllers.js'},function(a) { 
                  chrome.tabs.sendMessage(sender.tab.id, {name:'okay'});
                });
              });
            });
          });
        });
    }
});
// chrome.browserAction.onClicked.addListener(function(tab) {
//   chrome.tabs.create({'url': chrome.extension.getURL('advancedsettings.html')}, function(tab) {
//     // Tab opened.
//   });
// });
// getSettings
// 