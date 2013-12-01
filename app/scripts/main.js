// @copyright 2012+ Daniel Nakov / Silverline CRM 
// http://silverlinecrm.com



var ForceNavigator = {};
ForceNavigatorCore = function () {

    

}

var sfNav = window.sfNav;

if (sfNav === undefined) {
    sfNav = {};
  sfNav.core = new ForceNavigatorCore();
  sfNav.storage = new ForceNavigatorStorage();
}

ForceNavigatorCore.prototype.createElement = function(id) {
    this.elementId = id;
    var elem = document.createElement('div');
    elem.id = id;
    elem.innerHTML = '<div id="sfnav">\
                          <div id="sfnav-search">\
                            <input id="sfnav-search-field" type="search" value="" placeholder="Search">\
                          </div>\
                          <ul>\
                          </ul>\
                        </div>';
    this.element = elem;  
    $(elem).find('#sfnav-search-field').typeahead({
      name: 'listStuff',
      valueKey: 'name',
      engine: Hogan,
      template: [
        '<div class="sfnav-content">',
                  '<h4 class="sfnav-name">',
                    '{{name}}',
                  '</h4>',
                  'Something Else Here',
                '</div>'
      ].join(''),
      local: [{
            name: "New Account",
            key: "Account__c",
            url: "https://na12.salesforce.com/a00/e",
            tokens: ['New', 'Account']
        }],

    });

}


ForceNavigatorCore.prototype.show = function() {
    $('#contentWrapper').addClass('sfnav-blur-scale animated');
    this.createElement('sfnav-wrapper');
    this.elementVisible = true;
    $(document.body).prepend(this.element);
}

ForceNavigatorCore.prototype.hide = function() {
    $('#contentWrapper')
        .removeClass('sfnav-blur-scale-reverse sfnav-blur-scale animated')
        .addClass('sfnav-blur-scale-reverse animated').one('webkitAnimationEnd oAnimationEnd', function() {
            $(this).removeClass('sfnav-blur-scale-reverse sfnav-blur-scale animated');
        });

    $('#contentWrapper').addClass('sfnav-blur-scale-reverse');
    this.elementVisible = false;
    $('#' + this.elementId).remove();
}

ForceNavigatorCore.prototype.toggle = function() {
    if(this.elementVisible) this.hide();
    else this.show();
}

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {

        switch(request.name) {
            case 'toggle':
                sfNav.toggle();
        }
    });
chrome.extension.onRequest.addListener(function(e) {
    console.log(e);
});