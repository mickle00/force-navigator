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

 
// https://github.com/DerekRies/angular-keycombo
angular.module('keycombo', [] )
  .directive('keyCombo', [function () {

    return {
      restrict: 'A',
      require: '?ngModel',
      link: function (scope, element, attrs, ngModel) {
        // TODO: Capture mac cmd/win keys between browsers
        // TODO: Handle key sequences in addition to combinations
        var keyCombo = 'ctrl+a',
        modifiers = {16: 16, 17: 17, 18: 18},
        keyMapping = {
          16: 'shift',
          17: 'ctrl',
          18: 'alt',
          32: 'space',
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down',
          91: 'win',
          186: ';',
          187: '=',
          188: ',',
          189: '-',
          191: '/',
          192: '`',
          219: '[',
          220: '\\',
          221: ']',
          222: '\''
        },
        keysDown = {};

        function sortByLength (a,b) {
          if(a.length > b.length) {
            return -1;
          }
          else {
            return 1;
          }
        }

        function getKeysDown () {
          var keyComboSequence = [];
          for(var downKey in keysDown) {
            if(downKey in keyMapping) {
              keyComboSequence.push(keyMapping[downKey]);
            }
            else {
              keyComboSequence.push(String.fromCharCode(downKey));
            }
          }
          return keyComboSequence;
        }

        function makeStringFromKeysDown () {
          return getKeysDown().sort(sortByLength).join('+');
        }

        function updateModel (newVal) {
          if(ngModel){
            ngModel.$setViewValue(newVal);
          }
        }

        element.bind('keydown', function (e) {
          if(!(e.keyCode in modifiers)) {
            element.val('');
          }
          keysDown[e.keyCode] = true;
        });

        // Checking to make sure keys are not in modifiers so when
        // the keyup event for them happens they don't change the
        // combination in the input element
        element.bind('keyup', function (e) {
          if(!(e.keyCode in modifiers)) {
            keyCombo = makeStringFromKeysDown();
            updateModel(keyCombo);
            element.val(keyCombo);
          }
          delete keysDown[e.keyCode];
        });
      }
    };

  }]);