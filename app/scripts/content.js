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

 

	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {



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

	this.destroy = function() {
		destroyApp();
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
		if (document.body.firstChild.id == 'sfnav-wrapper') 
			{
				removeElement();		
			}
	}



	function createElement() {		
		if(this.rootEl !== undefined) return;
		this.rootEl = document.createElement('div');
		this.rootEl.id = 'sfnav-wrapper';
		this.rootEl.setAttribute('ng-app', 'forceNavigator');
		this.rootEl.setAttribute('ng-controller', 'MainCtrl');
		this.rootEl.innerHTML = '<sf-nav></sf-nav>';
		angular.bootstrap(this.rootEl, ['forceNavigator']);
		
		
	}
	function insertElement() {
		document.body.insertBefore(this.rootEl, document.body.firstChild);
		// document.getElementById('sfnav-search-field').focus();
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

	function destroyApp()
	{
		// var app = angular.element(document.getElementById('sfnav-wrapper'));
		// app.injector.invoke(function($rootScope) {
	 //        $rootScope.$apply(function() {
	 //             // get angular to tear down pretty much everything for us
	 //            $rootScope.templateUrl = null;
	 //        });
	 //    });
	 //    // hack to get browser object to unhook from global events
	 //    app.injector.get('$browser').destroy();
	 //    app.injector = null;
	 	location.reload();
	    // hide();
	}

}