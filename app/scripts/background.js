var urls = [];




// listen for changes of the keyboard shortcut
chrome.storage.onChanged.addListener(function(changes, storageType) {
  if(changes.shortcut !== undefined) {
    // unbind events here, meh
  }
});

function registerShortcutListener(tabId) 
{
  chrome.storage.local.get('shortcut', function(shortcut) { 

    chrome.tabs.executeScript(tabId, {file: 'scripts/mousetrap.min.js'},function(a) {   
      chrome.tabs.executeScript(tabId, {file: 'scripts/content.js'},function(a) { 
        chrome.tabs.sendMessage(tabId, {name: 'shortcut', value: shortcut});  
      });
    });

  });
}

function injectScripts(tabId) 
{
  // yeah, this sucks but i don't want to load Q just for this. 
  chrome.tabs.executeScript(tabId, {file: 'scripts/util.js'},function(a) { 
    chrome.tabs.executeScript(tabId, {file: 'bower_components/angular/angular.js'},function(a) { 
      chrome.tabs.executeScript(tabId, {file: 'scripts/app/app.js'}, function(a) { 
        chrome.tabs.executeScript(tabId, {file: 'scripts/app/services.js'},function(a) { 
          chrome.tabs.executeScript(tabId, {file: 'scripts/app/controllers.js'},function(a) { 
            chrome.tabs.sendMessage(tabId, {name:'app_loaded'});
          });
        });
      });
    });
  });
}

// toggle extension
chrome.browserAction.onClicked.addListener(function(tab) {
            chrome.tabs.getSelected(null, function(tab) {
              chrome.tabs.sendMessage(tab.id, {name: 'toggle', tabId:tab.id});
            });
        });
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == 'executeScripts')
    {
    }
});

// get all registered sites and add listeners only for them
chrome.storage.local.get(null, function(results) {
  for(var key in results)
  {
    str = '';
    if(key.substring(0,5) === 'site.')
    {
      urls.push(key.substring(5));
    }    
  }
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if (changeInfo.status === 'complete') {
          var url = tab.url.split('#')[0]; // Exclude URL fragments
          for (var i = urls.length - 1; i >= 0; i--) {
            if(URLPattern.matches(urls[i], url))
            {
              registerShortcutListener(tabId);
              break;
            }

          }            
        }

      });
});
 
 

  // CRAP BELOW
  // CRAP BELOW
  // CRAP BELOW
  // CRAP BELOW
  // TODO: need some mechanism for defaults because this sucks
  chrome.storage.local.get("site.https://*.salesforce.com/*", function(results) {
    if(Object.keys(results).length !== 0) return;

    var defaultStuff = 
    {
    "shortcut": {"main":"mod+f13"},
      "site.https://*.salesforce.com/*": 
      {
        "collections": 
        {
          
        },
      "services": 
      {
        "service.user.salesforce.se": 
        {
          "ngServiceName": "salesforceSvc",
          "refreshFrequency": 2
        },        
        "service.user.salesforce": 
        {
          "ngServiceName": "salesforceSvc",
          "refreshFrequency": 2
        },
        "service.user.forceTooling": 
        {
          "ngServiceName": "forceToolingSvc",
          "refreshFrequency": 2
        }
      },      
      "stats":
      {
        
      }       
      },
      "site.https://*.jira.com/*": 
      {
        "collections": 
        {
          
        },
      "services": 
      {
        "service.user.jira": 
        {
          "ngServiceName": "jiraSvc",
          "refreshFrequency": 2
        }
      },      
      "stats":
      {
        
      }       
      },      
      "settings": 
      {
        "lazyloadScripts": false
      },

    }
  
    chrome.storage.local.set(defaultStuff);
  });

// chrome.browserAction.onClicked.addListener(function(tab) {
//   chrome.tabs.create({'url': chrome.extension.getURL('advancedsettings.html')}, function(tab) {
//     // Tab opened.
//   });
// });
// getSettings
// 