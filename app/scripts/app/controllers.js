'use strict';

angular.module('forceNavigator')
  .controller('MainCtrl', function ($window, $scope, $rootScope, chromeStorage, $filter, keymaster, $http, $cookies) {

  	// wait for the stupid async storage data to load
  	chromeStorage.init().then(function(data) {
  		 registerListeners();
  		 onStorageChange();
  	});

  	var theUrl = location.href;

  	if($cookies.sid !== undefined)
  	{
  		$scope.sessionId = $cookies.sid;
  		$scope.orgId = $cookies.sid.split('!')[0];
  		$scope.instanceUrl = location.origin;
  	}

  	function getSiteKey() {
  		var urlPatternKey;
	    for (var key in chromeStorage.data.sites) {
	      if(URLPattern.matches(key, theUrl)) {
	      	$scope.urlPatternKey = key;
	      }
	    }
	    $scope.siteKey = 'site.' + $scope.urlPatternKey;
	    return $scope.siteKey;
  	}
    
 

  	function registerListeners() {
	   $rootScope.$on('storageChange.' + getSiteKey(), onStorageChange);
	    for(var key in $scope.collections) {
	    	$rootScope.$on('storageChange.' + key, onStorageChange);
	    }
  	}
 
 	var onStorageChange = function() {
		// get all collections for the current site
 
		// $rootScope.$on('storageChange.' + getSiteKey(), onStorageLoaded);

	    $scope.chromeStorage = chromeStorage;

	    $scope.apiVersion = chromeStorage.data[$scope.siteKey].apiVersion || 'v28.0';

	    $scope.collections = chromeStorage.data[$scope.siteKey].collections;
	    $scope.stats = chromeStorage.data[$scope.siteKey].stats || {};

	    // get all items for the collections
	    $scope.items = [];
	    for(var collectionKey in $scope.collections) {

	    	var itemsInStorage = chromeStorage.data[collectionKey];

	    	if(itemsInStorage !== undefined && itemsInStorage.data !== undefined) {
	    		itemsInStorage.data.forEach(function(_item) {
	    			var pos = $scope.items.map(function(e) { return e.name; }).indexOf(_item.name);
	    			
	    			if(pos < 0) pos = $scope.items.length;
					
					$scope.items[pos] = _item;
	    			// $scope.items[pos].stats = $scope.stats[_item.name];
	    		});
		   		
	    	}
		}

	    // check if there's already a collection for this org
	    var thisCollection = $scope.collections['collection.user.salesforce.' + $scope.orgId];
	    if(thisCollection !== undefined)
	    {
	    	// check and refresh collection if necessary
	    	if(shouldRefreshCollection(thisCollection)) refreshCollection(thisCollection);
	    }
	    // see if collection.user.salesforce is defined and generate an org collection	    
	    else if($scope.collections['collection.user.salesforce'] !== undefined)
	    {
	    	chromeStorage.data[siteKey]
	    	.collections['collection.user.salesforce.' + $scope.orgId] = 
	    	angular.copy($scope.collections['collection.user.salesforce']);
    		
 			refreshCollection(chromeStorage.data[siteKey]
	    	.collections['collection.user.salesforce.' + $scope.orgId]);

	    }
	}

	function shouldRefreshCollection(collection) {
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
	}

	function refreshCollection(collection)
	{

		var coll = collection;
		getSalesforceData($scope.instanceUrl, $scope.apiVersion, $scope.sessionId)
		.then(parseSFMetadata);
	}

	function parseSFMetadata(data, status, headers, config) {
		var items = [];
		angular.forEach(data.data.sobjects, function(value, key){
			var item = 
			{
				name : 'List ' + value.labelPlural,
				url : '/' + value.keyPrefix,
				keyPrefix : value.keyPrefix,
				label : value.label,
				icon : 'fa fa-list'			
			};
			items.push(item);

			item = {};
			item = 
			{
				name : 'New ' + value.labelPlural,
				url : '/' + value.keyPrefix + '/e',
				keyPrefix : value.keyPrefix,
				label : value.label,
				icon : 'fa fa-file-o'			
			};
			items.push(item);	
		});
		var collectionKey = 'collection.user.salesforce.' + $scope.orgId;
		
		chromeStorage.data[collectionKey] = angular.copy({data:items});
		var now = new Date();
		chromeStorage.data[$scope.siteKey].collections[collectionKey].lastRefreshed = now.getTime(); 
	}

	function getSalesforceData(url, apiVersion, sessionId) {
		return $http({	method: 'GET', 
						url: url + '/services/data/' + apiVersion + '/sobjects/', 
						headers: {'Authorization': 'Bearer ' + sessionId}
					});

	}

	$scope.selectedIndex = -1;

 	$scope.pressedEnter = function($event) {
 		if($scope.selectedIndex >= 0) $scope.go($scope.selectedIndex);
 	}
 	$scope.pressedUp = function($event) {
 		$scope.selectedIndex--;
 		if($scope.selectedIndex < 0) $scope.selectedIndex = $scope.filteredItems.length - 1;
 	}
 	$scope.pressedDown = function($event) {
 		$scope.selectedIndex++;
 		if($scope.selectedIndex > $scope.filteredItems.length - 1) $scope.selectedIndex = 0;
 	}

 	$scope.sortByMostHits = function(item)
 	{
 		if($scope.stats[item.name] !== undefined)
 			return $scope.stats[item.name].totalHits === undefined ? 0 : -1 * $scope.stats[item.name].totalHits;

 		return 0;
 	}

 	$scope.go = function(index) {
 		chromeStorage.data[$scope.siteKey].stats = chromeStorage.data[$scope.siteKey].stats || {};
 		chromeStorage.data[$scope.siteKey].stats[$scope.filteredItems[index].name] = chromeStorage.data[$scope.siteKey].stats[$scope.filteredItems[index].name] || {};

 		var keyStat = chromeStorage.data[$scope.siteKey].stats[$scope.filteredItems[index].name];
 		if(keyStat.totalHits === undefined) keyStat.totalHits = 1;
 		else	keyStat.totalHits++;

 		var now = new Date();
 		keyStat.lastHit = now.getTime();
 		chromeStorage.data[$scope.siteKey].stats[$scope.filteredItems[index].name] = angular.copy(keyStat);
 		//using this to make sure we get the callback when it's saved.
 		chromeStorage.set(chromeStorage.data, function() {
 			$window.location.href = $scope.filteredItems[index].url;
 		});
 	}

	angular.element($window).on('keydown', function(e) {
		switch (e.keyCode) {
			case 38:
				$scope.pressedUp();
				$scope.$apply();
				e.preventDefault();				
				break;
			case 40:
				$scope.pressedDown();
				$scope.$apply();
				e.preventDefault();				
				break;
			case 13:
				$scope.pressedEnter();
				$scope.$apply();
				e.preventDefault();
				break;
		}
		
    });

  });