'use strict';

angular.module('chromeStorage', [])
.factory('chromeStorage', function($q, $rootScope) {

 
	// ## _csResponse
	//
	// Private helper function that's used to return a callback to
	// wrapped `chrome.storage.*` methods.
	//
	// It will **resolve** the provided `$.Deferred` object
	// with the response, or **reject** it if there was an
	// error.
	function _csResponse(dfd) {
	return function() {
	  var err = chrome.runtime.lastError;
	  if (!err)
		dfd.resolve.apply(dfd, arguments);
	  else {
		console.warn("chromeStorage error: '%s'", err.message);
		dfd.reject(dfd, err.message, err);
	  }
	};
	}

	// ## chrome.storage.* API
	// Private factory functions for wrapping API methods

	// ### wrapMethod
	//
	// For wrapping **clear** and **getBytesInUse**
	function wrapMethod(method) {
	return function(cb) {
	  var dfd = $q.defer();

	  if (typeof cb === 'function')
		dfd.promise.finally(cb);

	  this.storage[method](_csResponse(dfd));

	  return dfd.promise;
	};
	}

	// ### wrapAccessor
	//
	// For wrapping **get**, **set**, and **remove**.
	function wrapAccessor(method) {
	return function(items, cb) {
	  var dfd = $q.defer();

	  if (typeof cb === 'function')
		dfd.promise.finally(cb);

	  this.storage[method](items, _csResponse(dfd));

	  return dfd.promise;
	};
	}
	
	var initData = function() {
		// var dObj = $q.defer();
		return obj.get(null).then(function(results) { 
			obj.data = results; 
			// $rootScope.$broadcast('storageLoaded');
		});	
		// return dObj.promise;	
	}

	  
	var obj =  {

		storage: chrome.storage['local'],
		
		getBytesInUse: wrapMethod('getBytesInUse'),

		clear: wrapMethod('clear'),

		get: wrapAccessor('get'),

		set: wrapAccessor('set'),

		remove: wrapAccessor('remove'),

		init: initData,

		// Pick out the relevant properties from the storage API.
		getQuotaObject: function() {
		  return _(this.storage).pick(
			'QUOTA_BYTES',
			'QUOTA_BYTES_PER_ITEM',
			'MAX_ITEMS',
			'MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE',
			'MAX_WRITE_OPERATIONS_PER_HOUR');
		}
	}



	



	chrome.storage.onChanged.addListener(function(changes, storageType) {
		for(var key in changes) {
			obj.data[key] = changes[key].newValue;
			$rootScope.$broadcast('storageChange.' + key);
			console.log('storageChange.' + key);
		}
	});



	$rootScope.$watch( function () { 
		return obj.data; 
	}, function ( data ) {
	  if(obj.data != undefined) obj.set(obj.data).then(function() { 
		console.log('data changed from watch');
	   });
	}, true);

	return obj;
});	

sfNav.service('salesforceSetupMenu', function($window, $q,$cookies,$location,$http) {

	this.isAsync = true;
	var serviceName = 'service.user.salesforce.setup';
	var orgId;
	var apiUrl;

	if($cookies.sid !== undefined)
	{
		var sessionId = $cookies.sid;
		var orgId = $cookies.sid.split('!')[0];
 
		var apiVersion = 'v28.0';
	}
	
	var urlArray = $location.$$absUrl.split('.');
	var instance;
	var r = /cs\d{1,2}|na\d{1,2}/;
	for (var i = 0; i < urlArray.length; i++) {
		if(r.exec(urlArray[i]) != null) {
			instance = r.exec(urlArray[i]);
			break;
		}
	}

	if (instance === undefined) {
		apiUrl = $location.origin;
	}
	else
	{
		apiUrl = 'https://' + instance + '.salesforce.com';
	}

    function _parseSetupTree(html)
    {
		var collection = {
			collectionId : 'collection.user.salesforce.setup.' + orgId,
			serviceId : serviceName,
			items : []
		};

        var allLinks = html.getElementById('setupNavTree').getElementsByClassName("parent");
        var strName;
        var as;
        var strNameMain;
        var strName;
        for(var i = 0; i<allLinks.length;i++)
        {

            var as = allLinks[i].getElementsByTagName("a");
            for(var j = 0;j<as.length;j++)
            {
                if(as[j].id.indexOf("_font") != -1)
                {
                    strNameMain = as[j].text + ' > ';
                    break;
                }

            }
            var children = allLinks[i].getElementsByClassName("childContainer")[0].getElementsByTagName("a");
            for(var j = 0;j<children.length;j++)
            {
                if(children[j].text.length > 2)
                {
                    strName = strNameMain + children[j].text;
					var item = 
					{
						type: 'url',
						name : strName,
						url : children[j].href,
						label : strName,
						icon : 'fa fa-cogs'	
					};
					collection.items.push(item);                    
                }
            }

        }
        return collection;
    }


	this.doAction = function(selectedItem)
	{
		var dfd = $q.defer();

		if(selectedItem.type== 'url')
		{
			$window.location.href = selectedItem.url;
			dfd.resolve();
		}
		return dfd.promise;
	}

	this.$getData = function(existingCollections) {

		var dfd = $q.defer();

		// siteSvc sends the existing collections
		// if a collection needs to be refreshed,
		// it won't be sent as part of the existing collections

		for(var key in existingCollections)
		{
			if(key === 'collection.user.salesforce.setup.' + orgId)
			{
				dfd.resolve();
				return dfd.promise;
			}
		}

		$http({	method: 'GET', 
						url: apiUrl + '/setup/forcecomHomepage.apexp?setupid=ForceCom',
						responseType: 'document' })
		.success(function(data, status, headers, config) {
			dfd.resolve(_parseSetupTree(data));
		})
		.error(function(data, status, headers, config) {
			dfd.reject(data);
		});

		return dfd.promise; 	 		

	}
});

sfNav.service('salesforceSvc', function($q,$window, $cookies, $location, $http) {

	this.isAsync = true;
	var serviceName = 'service.user.salesforce';
	var orgId;
	var apiUrl;

	if($cookies.sid !== undefined)
	{
		var sessionId = $cookies.sid;
		var orgId = $cookies.sid.split('!')[0];
 
		var apiVersion = 'v28.0';
	}
	
	var urlArray = $location.$$absUrl.split('.');
	var instance;
	var r = /cs\d{1,2}|na\d{1,2}/;
	for (var i = 0; i < urlArray.length; i++) {
		if(r.exec(urlArray[i]) != null) {
			instance = r.exec(urlArray[i]);
			break;
		}
	}

	if (instance === undefined) {
		apiUrl = $location.origin;
	}
	else
	{
		apiUrl = 'https://' + instance + '.salesforce.com';
	}


	function _parseMetadata(data) {
		var collection = {
			collectionId : 'collection.user.salesforce.' + orgId,
			serviceId : serviceName,
			items : []
		};

		angular.forEach(data.sobjects, function(value, key){
			var item = 
			{
				type: 'url',
				name : 'List ' + value.labelPlural,
				url : '/' + value.keyPrefix,
				keyPrefix : value.keyPrefix,
				label : value.label,
				icon : 'fa fa-list'			
			};
			collection.items.push(item);

			item = {};
			item = 
			{
				type: 'url',
				name : 'New ' + value.labelPlural,
				url : '/' + value.keyPrefix + '/e',
				keyPrefix : value.keyPrefix,
				label : value.label,
				icon : 'fa fa-file-o'			
			};
			collection.items.push(item);	
		});
		return collection;	
	}

	this.doAction = function(selectedItem)
	{
		var dfd = $q.defer();

		if(selectedItem.type== 'url')
		{
			$window.location.href = selectedItem.url;
			dfd.resolve();
		}
		return dfd.promise;
	}

	this.$getData = function(existingCollections) {

		var dfd = $q.defer();

		// siteSvc sends the existing collections
		// if a collection needs to be refreshed,
		// it won't be sent as part of the existing collections

		for(var key in existingCollections)
		{
			if(key === 'collection.user.salesforce.' + orgId)
			{
				dfd.resolve();
				return dfd.promise;
			}
		}

		$http({	method: 'GET', 
						url: apiUrl + '/services/data/' + apiVersion + '/sobjects/', 
						headers: {'Authorization': 'Bearer ' + sessionId} })
		.success(function(data, status, headers, config) {
			dfd.resolve(_parseMetadata(data));
		})
		.error(function(data, status, headers, config) {
			dfd.reject(data);
		});

		return dfd.promise; 	 		

	}
});

sfNav.service('jiraSvc', function($q, $window, $cookies, $location, $http) {

	this.isAsync = true;
	var serviceName = 'service.user.jira';
	

	function _parseData(data) {
		var collection = {
			collectionId : 'collection.user.jira.' + $location.host(),
			serviceId : serviceName,
			items : []
		};

		angular.forEach(data, function(value, key){
			var item = 
			{
				type: 'url',
				name : 'Issues: ' + value.key,
				longName : value.name,
				url : '/browse/' + value.key,
				img : value.avatarUrls['24x24'],
				pid : value.id

			};
			collection.items.push(item);

			item = {};
			item = 
			{
				type: 'url',
				name : 'Wiki: ' + value.key,
				longName : value.name,
				url : '/wiki/display/' + value.key,
				img : value.avatarUrls['24x24'],
				pid : value.id

			};
			collection.items.push(item);	
		});
		return collection;	
	}
	this.doAction = function(selectedItem)
	{
		var dfd = $q.defer();

		if(selectedItem.type== 'url')
		{
			$window.location.href = selectedItem.url;
			dfd.resolve();
		}
		return dfd.promise;
	}

	this.$getData = function(existingCollections) {

		var dfd = $q.defer();

		// siteSvc sends the existing collections
		// if a collection needs to be refreshed,
		// it won't be sent as part of the existing collections

		for(var key in existingCollections)
		{
			if(key === 'collection.user.jira.' + $location.host())
			{
				dfd.resolve();
				return dfd.promise;
			}
		}

		$http({	method: 'GET', 
						url: 'https://' + $location.host() + '/rest/api/2/project'})
		.success(function(data, status, headers, config) {
			dfd.resolve(_parseData(data));
		})
		.error(function(data, status, headers, config) {
			dfd.reject(data);
		});

		return dfd.promise; 	 		

	}
});

sfNav.service('forceToolingSvc', function($q, $cookies, $location, $http) {

	this.isAsync = true;
	var serviceName = 'service.user.forceTooling';
	var orgId;
	var apiUrl;

	if($cookies.sid !== undefined)
	{
		var sessionId = $cookies.sid;
		var orgId = $cookies.sid.split('!')[0];
		var apiVersion = 'v28.0';
	}
	
	var urlArray = $location.$$absUrl.split('.');
	var instance;
	var r = /cs\d{1,2}|na\d{1,2}/;
	for (var i = 0; i < urlArray.length; i++) {
		if(r.exec(urlArray[i]) != null) {
			instance = r.exec(urlArray[i]);
			break;
		}
	}

	if (instance === undefined) {
		apiUrl = $location.origin;
	}
	else
	{
		apiUrl = 'https://' + instance + '.salesforce.com';
	}

	this.CustomFieldTypes = {
		AUTONUMBER 	: {name:"AutoNumber"	,code:"an"},
		CHECKBOX 	: {name:"Checkbox"		,code:"cb"},
		CURRENCY 	: {name:"Currency"		,code:"curr"},
		DATE 		: {name:"Date"			,code:"d"},
		DATETIME 	: {name:"DateTime"		,code:"dt"},
		EMAIL 		: {name:"Email"			,code:"e"},
		FORMULA 	: {name:"FORMULA"		,code:"form"},
		GEOLOCATION : {name:"Location"		,code:"geo"},
		NUMBER 		: {name:"Number"		,code:"n"},
		PERCENT 	: {name:"Percent"		,code:"per"},
		PHONE 		: {name:"Phone"			,code:"ph"},
		PICKLIST 	: {name:"Picklist"		,code:"pl"},
		TEXT 		: {name:"Text"			,code:"t"},
		TEXTAREA 	: {name:"TextArea"		,code:"ta"},
		TEXTAREALONG: {name:"LongTextArea"	,code:"tal"},
		TEXTAREARICH: {name:"Html"			,code:"tar"},
		URL 		: {name:"Url"			,code:"url"},
		PICKLISTMS 	: {name:"MultiselectPicklist",code:"plms"},
		ROLLUPSUMMARY : {name:"Summary"		,code:"rup"},
		HIERARCHICALRELATIONSHIP : {name:"Hierarchy",code:"hr"},
		LOOKUPRELATIONSHIP : {name:"Lookup",code:"look"},
		MASTERDETAILRELATIONSHIP : {name:"MasterDetail",code:"md"},
		TEXTENCRYPTED : {name:"EcryptedText",code:"te"}
	};

	this.$getData = function(existingCollections) {
		var dfd = $q.defer();

		var collection = {
			collectionId : 'collection.user.forceTooling',
			serviceId : serviceName,
			items : []
		};
		for(var key in existingCollections)
		{
			if(key === 'collection.user.forceTooling')
			{
				dfd.resolve();
				return dfd.promise;
			}
		}

		angular.forEach(this.CustomFieldTypes, function(value, key){
			var item = 
			{
				type:'action',
				name : 'Create Field: ' + value.name,
				quick : 'cf ' + value.code,
				action: 'help!!',// need to figure out what goes in here:
				icon : 'fa fa-plus-square-o'	
			};
			collection.items.push(item);
		});
		dfd.resolve(collection);
		return dfd.promise;
	}
	this.doAction = function(selectedItem)
	{
		var dfd = $q.defer();

		if(selectedItem.type== 'action')
		{
			
			dfd.resolve();
		}
		return dfd.promise;
	}

	this.$createField = function(payload) {

		var dfd = $q.defer();

		$http({	method: 'POST', 
				url: apiUrl + '/services/data/' + apiVersion + '/tooling/sobjects/CustomField/', 
				data:JSON.stringify(payload),
				headers: {'Authorization': 'Bearer ' + sessionId} })
		.success(function(data, status, headers, config) {
			// data.id = String of new id; 
			// data.success = true;
			// data.erorrs = []
			dfd.resolve(); //report back somehow.
		})
		.error(function(data, status, headers, config) {
			dfd.reject(data.errors); // need a better way to report errors.
		});

		return dfd.promise;
	}
});

sfNav.service('siteSvc', function ($q,$injector, $rootScope, $location) {	
	var chromeStorage = $injector.get('chromeStorage');
	var services = {};
	var items = [];
	var stats = {};
	var collectionsToGet = {};
	var collections = {};
	var servicesDef = {};
	var siteKey = '';
	var listenersRegistered = false;

	var that = this;
	this.collections = collections;
	this.stats = stats;
	this.items = items;

	function _getSiteKey() {
		var urlPatternKey;
		for (var key in chromeStorage.data) {
			if(key.substring(0,5) === 'site.') {
				if(URLPattern.matches(key.substring(5), $location.$$absUrl)) {
					urlPatternKey = key.substring(5);
				}
			}
		}
		siteKey = 'site.' + urlPatternKey;
		return siteKey;
	};	

	function _registerListeners() {
	   // $rootScope.$on('storageChange.' + siteKey, onStorageChange);
	   if(!listenersRegistered) {
			for(var key in collections) {
				$rootScope.$on('storageChange.' + key, function() { 
					_initItems(); 
					$rootScope.$apply();
				});
			}
			listenersRegistered = true;
		}
	};

	function _shouldRefreshCollection(collection) {
		if(collection !== undefined) {
			var now = new Date();

			if(collection.lastRefreshed === undefined)  
				return true;
			if(Math.round((now-new Date(parseInt(collection.lastRefreshed, 10)))/60000) < collection.refreshFrequency)
				return false;
			else
				return true;
		}
		return false;
	};

	this.go = function(selectedItem){
		var dfd = $q.defer();
		// determine which service this item came from and call that services doAction Method;
		// hmmmm let's hope there is an easy angular way to do this.
		_getSiteKey();
		for(var key in chromeStorage.data[siteKey].collections)
		{
			if(chromeStorage.data[key].data != undefined)
			{
				for(var i=0; i<chromeStorage.data[key].data.length; i++)
				{
					if(chromeStorage.data[key].data.indexOf(selectedItem) >= 0)
					{
						var itemServiceName = chromeStorage.data[siteKey].collections[key].ngServiceName;
						$injector.get(itemServiceName).doAction(selectedItem).then(function(data){
							dfd.resolve(data);
						});
					}
				}	
			}
		}
		return dfd.promise;
	}

	this.init = function() {
		_getSiteKey();
		

		collectionsToGet = {};
		collections = chromeStorage.data[siteKey].collections || {};

		for(var key in collections)
		{
			var tc = collections[key];
			if(!_shouldRefreshCollection(tc))
				collectionsToGet[key] = tc;
		}

		servicesDef = chromeStorage.data[siteKey].services || {};
		stats = chromeStorage.data[siteKey].stats || {};
		this.stats = stats;

		_initItems();
		_injectServices();
		_getDataFromServices();
		_registerListeners();
	}

	this.refresh = function() {

		collectionsToGet = {};

		servicesDef = chromeStorage.data[siteKey].services || {};
		stats = chromeStorage.data[siteKey].stats || {};
		this.stats = stats;
		_initItems();
		_injectServices();
		_getDataFromServices();  		
	}

	function _injectServices() {
		for(var key in servicesDef)
		{
			services[key] = $injector.get(servicesDef[key].ngServiceName);
		}
	}
	
	function _getDataFromServices() {
		for(var key in services)
		{
			if(services[key].isAsync === true)
			{	 
				services[key].$getData(collectionsToGet).then(_addDataToList);
			}
			else
			{
				_addDataToList(services[key].getData());
			}
		}
	}

	function _addDataToList(data) {
		
		_registerListeners();

		if(data === undefined) return;

		_registerCollection(data);
		_initItems();
		
	}

	function _initItems() {
		items.length = 0;

		for(var collectionKey in collections) {

			var itemsInStorage = chromeStorage.data[collectionKey];

			if(itemsInStorage !== undefined && itemsInStorage.data !== undefined) {
				itemsInStorage.data.forEach(function(_item) {
					var pos = items.map(function(e) { return e.name; }).indexOf(_item.name);
					
					if(pos < 0) pos = items.length;
					
					items[pos] = _item;
					// this.items[pos].stats = this.stats[_item.name];
				});
				
			}
		}		
	}  	

	function _registerCollection(collection) {
		var now = new Date();

		chromeStorage.data[collection.collectionId] = { data:collection.items };
		collections[collection.collectionId] = angular.copy(servicesDef[collection.serviceId]);
		collections[collection.collectionId].lastRefreshed = now.getTime();
	}

});