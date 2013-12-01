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


 
