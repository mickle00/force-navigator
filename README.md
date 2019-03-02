# Salesforce Navigator for Lightning
**[Available on Chrome Web Store now](https://chrome.google.com/webstore/detail/salesforce-navigator-for/pbjjdhghffpemcglcadejmkcpnpmlklh)**

## Now supports Lightning

This extension helps you get to any Salesforce page quickly. Just type in what you need to do.

- All standard objects list views and create new pages are available (even for objects that don't have tabs). Type in "List <Object Name>" or "New <Object Name>"
- Custom objects supported, used the Detailed Mode setting to toggle between direct Lightning setup page links and general links
-- "List" and "New" are in progress, Lighting prevents simple REST API access to get at the key prefix
- All setup links are available -- Type in "Setup" to see all. For example, if you want to get to the Account fields setup, type in "Account Fields". Or any custom object setup page, type "setup <Custom Object Name>"
-- Many setup links take you to the Classic version, but that is a work in progress too

- (beta) Thanks to the SF tooling API, you can now create fields from Classic. "cf Account newField TEXT 100."
- (beta) Thanks to the SF tooling API, you can now login as other users from Classic. "login as USERNAME"

Maintainer(s):
[Danny Summerlin](http://summerlin.co)
open to others!
_based on Salesforce Navigator by [Daniel Nakov](https://twitter.com/dnak0v) and [Wes Weingartner](https://twitter.com/wes1278)_

## Getting Started
Project was scaffolded using [Yeoman](http://yeoman.io/) using [generator-chrome-extension](https://github.com/yeoman/generator-chrome-extension)

## Test
To test, go to: chrome://extensions, enable Developer mode and load app as an unpacked extension.

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)

