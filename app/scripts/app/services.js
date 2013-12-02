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

sfNav.service('salesforceSvc', function($q, $cookies, $location, $http) {

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

sfNav.service('siteSvc', function ($injector, $rootScope, $location) {

	var chromeStorage = $injector.get('chromeStorage');
	var services = {};
	var items = [];
	var stats = {};
	var collectionsToGet = {};
	var collections = {};
	var servicesDef = {};
	var siteKey = '';
 	
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
	   //  for(var key in this.collections) {
	   //  	$rootScope.$on('storageChange.' + key, onStorageChange);
	   //  }
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

  	this.init = function() {
  		_getSiteKey();
  		_registerListeners();

		collectionsToGet = {};
		collections = chromeStorage.data[siteKey].collections;

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
  		
  		if(data === undefined) return;

  		_registerCollection(data);
  		_initItems();

  	}

	function _initItems() {
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
 
