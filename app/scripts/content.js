/*
background->Chrome: listen for tab changes
Chrome->background: tab changed
background->background: check if URL is defined
background->tab: inject keyboard shortcut listener
tab->tab: keyboard shotcut hit
tab->background: give me app
background->tab: inject angular app
*/

var sfnav = new function() {

	chrome.extension.onMessage.addListener(
	    function(request, sender, sendResponse) {

	        switch(request.name) {
	            case 'toggle':
	                toggle();
	                break;
	            case 'app_loaded':
	            	createElement();
					insertElement();
					break;
				case 'shortcut':
					registerShortcut(request.value.shortcut.main);
	        }
	    });

	function registerShortcut(shortcut) {

		Mousetrap.bindGlobal(shortcut.toLowerCase(), function() { 
			toggle(); 
		});	
	}

	this.toggle = function() {
		toggle();
	}

	this.hide = function() {
		hide();
	}

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

	function hide() {
		if (document.body.firstChild.id == 'sfnav-wrapper') removeElement();		
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
		Mousetrap.bindGlobal('esc', function() {
			hide(); 
		});			
	}
	function removeElement() {
		document.body.removeChild(document.body.firstChild);
		angular.element(window).off();
		Mousetrap.unbind('esc');
	}

	// TODO: need some mechanism for defaults because this sucks
	chrome.storage.local.get("site.https://*.salesforce.com/*", function(results) {
		if(Object.keys(results).length !== 0) return;

		var defaultStuff = 
		{
		  "site.https://*.salesforce.com/*": 
		  {
		    "collections": 
		    {
		      
		    },
			"services": 
			{
				"service.user.salesforce": 
				{
				  "ngServiceName": "salesforceSvc",
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

};


 