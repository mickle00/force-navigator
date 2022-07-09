# Salesforce Navigator for Lightning
**[Available on Chrome Web Store now](https://chrome.google.com/webstore/detail/salesforce-navigator-for/pbjjdhghffpemcglcadejmkcpnpmlklh)**

## Now supports Lightning

Get more done in Salesforce - list and search records, make new ones, create a task or login as on the fly!
This extension helps you get to any Salesforce page quickly. Just type in what you need to do!
Compatible with Lightning and Classic

Open the Navigator and
- [New Permission] Can now save some settings, like theme and profile setup toggle, needs Storage permission to save preferences
- [New Feature] Themes! Right now has Default, Dark, Unicorn, and Solarized, open to suggestions
- [New Feature] Toggle all checkboxes on the page for when subtracting from a selection is faster
- [Fix] Better Classic to Lightning URL mapping
- [Fix] Better loading checks so it won't error out trying to set the style of the search box

- Use the account merge tool by typing "Merge Accounts <optional Account ID>"
Call the Classic Account Merge from either interface using the Account you are on and the Salesforce ID in your clipboard or entered into the command box. You can use a tool like Salesforce CopyPasteGo (https://summerlin.co/copypastego) to easily grab the ID of a Salesforce record
- Add tasks on the fly by typing "! <your task>"
- Search all records with "? <search terms>"
- Go to your Home page with "Home"
- Object List views with "List <Object>"
- Create a new record with "New <Object>"
- Go directly a Setup page by typing it's name
- Access Object customizations with "<Object> <Section>" (e.g. "Contact Fields")
- Switch between Lightning and Classic with "Toggle Lightning"
- Commands looking weird? Run "Refresh Metadata" to make sure you have what you need
- Login as another user with "Login as <partial match of username>"

** You can hold shift or control when you press enter or click your mouse to open the selected item in a new tab **

Default shortcut keys
(use Command instead of Control on Mac, and/or customize your options at chrome://extensions/shortcuts)
- Control + Shift + Space: Navigator Bar
- Control + Shift + A: Lightning App Menu
- Control + Shift + 1: Tasks
- Control + Shift + 2: Reports

NOTE: If you have a custom instance Domain Name, you may have to create a CSP Trusted Site Definition for your Classic domain URL in order for this extension to work - more info here https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/csp_trusted_sites.htm

Contribute to this extension at https://github.com/dannysummerlin/force-navigator

UPDATE NOTES
########################################
7/5 - Pride Month never ends, go learn about Marsha P Johnson - fixed my fixing, Lightning URLs properly replace Classic links better now, still more to be done on this though
5/28 - Watch https://youtube.com/c/FDSignifire - Several fixes, added checkbox toggle, removed unused permission

9/11 - #justiceforbreonnataylor (182 days and counting) - Added the ability to call the Classic Account merge tool from an Account page. Be sure to have the ID of the Account you want to merge in your clipboard; added Lightning Record Page shortcut for custom objects

8/29 - Rest in Power Chadwick Boseman. Thanks to CKloppel for pointing out missing API and click handling, now updated to v49 and new-tab clicks work again

6/19 - Happy Juneteenth! Thanks to kacrouse for Custom Metadata Lightning handling, also updating several changed URLs across the platform


Maintainer(s):
[Danny Summerlin](http://summerlin.co)
open to others!
_based on Salesforce Navigator by [Daniel Nakov](https://twitter.com/dnak0v) and [Wes Weingartner](https://twitter.com/wes1278)_

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)

## Privacy Policy
This extension only runs locally in communication with your instance of Salesforce. No data is collected from any user, nor is extension activity tracked or reported to a third-party.

## Terms of Service
This extension is not intended to support the work of any individual or organization that is discriminatory or outright illegal.