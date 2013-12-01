(function() {

	chrome.extension.onMessage.addListener(
	    function(request, sender, sendResponse) {

	        switch(request.name) {
	            case 'toggle':
	                toggle();
	                break;
	            case 'okay':
	            	createElement();
					insertElement();
					break;
	        }
	    });

	function toggle() {
		if(typeof this.rootEl === 'undefined')
		{
			chrome.storage.local.get('settings', function(settings) {
				if(settings.lazyloadScripts)
				{
					chrome.runtime.sendMessage('executeScripts', function(response) {});
				}
				else
				{
					createElement();
 					insertElement();
				}
			});
			return;

		}
		if (document.body.firstChild.id == 'sfnav-wrapper') removeElement();
		else insertElement();
	}
	function createElement() {
		this.rootEl = document.createElement('div');
		this.rootEl.id = 'sfnav-wrapper';
		this.rootEl.setAttribute('ng-app', 'forceNavigator');
		this.rootEl.setAttribute('ng-controller', 'MainCtrl');
		this.rootEl.innerHTML = '<sf-nav></sf-nav>';
		angular.bootstrap(this.rootEl, ['forceNavigator']);
		
	}
	function insertElement() {
		document.body.insertBefore(this.rootEl, document.body.firstChild);
		document.body.classList.add('sfnav-noscroll');
	}
	function removeElement() {
		document.body.removeChild(document.body.firstChild);
		angular.element(window).off();		
	}

	// TODO: need some mechanism for defaults because this sucks
	chrome.storage.local.get("site.https://*.salesforce.com/*", function(results) {
		if(Object.keys(results).length !== 0) return;

		var defaultStuff = 
		{
		  "site.https://*.salesforce.com/*": {
		    "collections": {
		      "collection.user.salesforce": {
		        // "lastRefreshed": "",
		        "refreshFrequency": 2 // in min
		      }
		    }
		    // "stats": {
		    // }
		  },
		  'settings': {
		  	lazyloadScripts: false
		  }
		}
		chrome.storage.local.set(defaultStuff);
		
	});



})();
 