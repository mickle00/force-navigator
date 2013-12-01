/*
sites-config:

'https://*.force.com/*':
{
  'globalCollections': 
  {
    'collection.global.salesforce',
  },
  'userCollections': [function() {
      generateCollectionForOrgId(orgId);
      return 
      {
   
        '00D12aSDaffddf' : 
        [
          'collection.global.salesforce',
          // 'collection.global.jira',
          'collection.user.salesforce.00D12aSDaffddf',
          'collection.user.salesforce.'
        ]
      }
    }
  ]
}

collections-list:

function generateCollectionFromMetadata()
{
  return 
  {
    'collection.user.salesforce.00D12aSDaffddf' : 
    [ 
      retrieveData : function() {},
      lastRetrieved : 'somedate'
      {
        name: "List Account",
        key: "Account__c",
        url: "/a00/e",
        tokens: ['New', 'Account']
      }
    ]
  }
}

*/
var ForceNavigatorStorage = function () {

  // keep settings in sync
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(namespace == 'local' && changes['settings'] != undefined)
      this.settings = changes['settings'];
  });
  
}

ForceNavigatorStorage.prototype.testSet = function() {
  var obj = {
    "collection.user.salesforce.00D12aSDaffddf": 
     {
      "retrieveData" : "getMetadata"
      "lastRetrieved" : "somedate",
      "list": [
        {
          name: "List Account",
          key: "Account__c",
          url: "/a00/e",
          tokens: ["New", "Account"]
        }
      ]
    }
    };
  chrome.storage.local.set(obj);
}

ForceNavigatorStorage.prototype.collectionFromSFMetadata = function() {
  $.ajax({
    url : getServerInstance() + '.salesforce.com/services/data/' + SFAPI_VERSION + '/sobjects/',

  });
}

ForceNavigatorStorage.prototype.setSettings = function (settings) {
  chrome.storage.local.set({'settings': settings});
}
ForceNavigatorStorage.prototype.getSettings = function(onGetSettings) {
  chrome.storage.local.get({'settings'}, onGetSettings);
}


ForceNavigatorStorage.prototype.getItemsMatchingURLAndKeyPath = function(url, keypath, callback) {
  this.getURLKeys(url, function(keys) {
    chrome.storage.local.get(keys, function(results) {
      callback(results.getByPath(keypath));
    });
  });
}

ForceNavigatorStorage.prototype.getDataForItems = function(items, callback) {
  this.getURLKeys(url, function(keys) {
    chrome.storage.local.get(keys, function(results) {
      callback(results.getByPath(keypath));
    });
  });
}

ForceNavigatorStorage.prototype.getURLKeys = function(url, callback) {
  var theUrl = url;
  chrome.storage.local.get('urlPatterns', function(results) {
    var keys = [];
    for (key in results) {
      if(URLPattern.matches(key, theUrl)) {
        keys.push(key);
      }
    };
    callback(keys);
  });
}