'use strict';

var sfNav = angular.module('forceNavigator', ['chromeStorage','ngCookies']);

sfNav.directive('sfNav', function () {
  return {
    restrict: 'E',
    templateUrl: chrome.extension.getURL('scripts/app/mainView.html'),
    replace: true,
  };
})

sfNav.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    chrome.extension.getURL('') + '**']);
 
 });

 

