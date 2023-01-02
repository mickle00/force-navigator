import { lisan, t } from "lisan"
import ui from "./ui"
const currentDictionary = require("./languages/en-US.js")
lisan.add(currentDictionary)


export let forceNavigatorSettings = {
	"MAX_SEARCH_RESULTS": 32,
	"theme":'theme-default',
	"searchLimit": 16,
	"enhancedprofiles": true,
	"debug": false,
	"developername": false,
	"lightningMode": true,
	"availableThemes": ["Default", "Dark", "Unicorn", "Solarized"],
	"ignoreList": null, // ignoreList will be for filtering custom objects, will need an add, remove, and list call
	"changeDictionary": (newLanguage) => lisan.add(require("./languages/" + newLanguage + ".js")),
	"setTheme": (cmd)=>{
		let cmdSplit = cmd.split(' ')
		const newTheme = "theme-" + cmdSplit[2].toLowerCase()
		document.getElementById('sfnavStyleBox').classList = [newTheme]
		forceNavigatorSettings.set("theme", newTheme)
	},
	"set": (key, value)=>chrome.storage.sync.set( (({})[key]=value), response=>refreshAndClear()),
	"loadSettings": ()=>{
		chrome.storage.sync.get(forceNavigatorSettings, settings=>{
			forceNavigatorSettings = settings
			forceNavigator.serverInstance = forceNavigator.getServerInstance(forceNavigatorSettings)
			if(forceNavigator.sessionId === null) {
				chrome.runtime.sendMessage({ "action": "getApiSessionId", "key": forceNavigator.organizationId }, response=>{
					if(response && response.error) console.log("response", orgId, response, chrome.runtime.lastError)
					else {
						forceNavigator.sessionId = unescape(response.sessionId)
						forceNavigator.userId = unescape(response.userId)
						forceNavigator.apiUrl = unescape(response.apiUrl)
						forceNavigator.loadCommands(settings)
						ui.hideLoadingIndicator()
						ui.bindShortcuts()
					}
				})
			}
		})
	}
}

export const forceNavigator = {
	"organizationId": null,
	"userId": null,
	"sessionId": null,
	"sessionHash": null,
	"serverInstance": null,
	"apiUrl": null,
	"apiVersion": "v56.0",
	"loaded": false,
	"searchBox": null,
	"listPosition": -1,
	"ctrlKey": false,
	"debug": false,
	"newTabKeys": [ "ctrl+enter", "command+enter", "shift+enter" ],
	"regMatchSid": /sid=([a-zA-Z0-9\.\!]+)/,
	"otherExtensions": [{
		"platform": "chrome-extension",
		"id": "aodjmnfhjibkcdimpodiifdjnnncaafh",
		"urlId": "aodjmnfhjibkcdimpodiifdjnnncaafh",
		"name": "Salesforce Inspector",
		"checkData": {"message": "getSfHost", "url": location.href},
		"commands": [
			{"label": "Data Export", "url": "/data-export.html?host=$APIURL", "key": "other.inspector.dataExport"}
		]
	},{
		"platform": "moz-extension",
		"id": "jid1-DBcuAQpfLMcvOQ@jetpack",
		"urlId": "e348e121-3b7c-4203-beaf-9f53cf606077",
		"name": "Salesforce Inspector",
		"checkData": {"message": "getSfHost", "url": location.href},
		"commands": [
			{"label": "Data Export", "url": "/data-export.html?host=$APIURL", "key": "other.inspector.dataExport"}
		]
	}],
	"commands": {},
	"init": ()=>{
		try {
			document.onkeyup = (ev)=>{ window.ctrlKey = ev.ctrlKey }
			document.onkeydown = (ev)=>{ window.ctrlKey = ev.ctrlKey }
			forceNavigator.organizationId = document.cookie.match(/sid=([\w\d]+)/)[1]
			forceNavigator.sessionHash = forceNavigator.getSessionHash()
			forceNavigatorSettings.loadSettings()
			ui.createBox()
console.log(5)
		} catch(e) { if(forceNavigatorSettings.debug) console.log(e) }
	},
	"resetCommands": ()=>{
		forceNavigator.commands = {}
		Array(
			"commands.home",
			"commands.setup",
			"commands.mergeAccounts",
			"commands.toggleAllCheckboxes",
			"commands.toggleLightning",
			"commands.loginAs",
			"commands.help",
			"commands.objectManager",
			"commands.toggleEnhancedProfiles",
			"commands.refreshMetadata",
			"commands.dumpDebug",
			"commands.setSearchLimit"
		).forEach(c=>{
			const k = t(c)
			forceNavigator.commands[k] = {"key": c}
		})
		forceNavigatorSettings.availableThemes.forEach(th=>forceNavigator.commands[t("commands.themes" + th)] = { "key": "commands.themes" + th })
	},
	"getServerInstance": (settings = {})=>{
		let targetUrl
		let url = location.origin + ""
		if(settings.lightningMode) {// if(url.indexOf("lightning.force") != -1)
			targetUrl = url.replace('lightning.force.com','').replace('my.salesforce.com','') + "lightning.force.com"
		} else {
			if(url.includes("salesforce"))
				targetUrl = url.substring(0, url.indexOf("salesforce")) + "salesforce.com"
			else if(url.includes("cloudforce"))
				targetUrl = url.substring(0, url.indexOf("cloudforce")) + "cloudforce.com"
			else if(url.includes("visual.force")) {
				let urlParseArray = url.split(".")
				targetUrl = urlParseArray[1] + '.salesforce.com'
			} else {
				targetUrl = url.replace('lightning.force.com','') + "my.salesforce.com"
			}
		}
		return targetUrl
	},
	"getSessionHash": ()=>{
		try {
			let sId = document.cookie.match(forceNavigator.regMatchSid)[1]
			return sId.split('!')[0] + '!' + sId.substring(sId.length - 10, sId.length)
		} catch(e) { if(debug) console.log(e) }
	},
	"getHTTP": (targetUrl, type = "json", headers = {}, data = {}, method = "GET") => {
		let request = { method: method, headers: headers }
		if(Object.keys(data).length > 0)
			request.body = JSON.stringify(data)
		return fetch(targetUrl, request).then(response => {
			forceNavigator.apiUrl = response.url.match(/:\/\/(.*)salesforce.com/)[1] + "salesforce.com"
			switch(type) {
				case "json": return response.clone().json()
				case "document": return response.clone().text()
			}
		}).then(data => {
			if(typeof data == "string")
				return (new DOMParser()).parseFromString(data, "text/html")
			else
				return data
		})
	},
	"refreshAndClear": ()=>{
		showLoadingIndicator()
		serverInstance = forceNavigator.getServerInstance(forceNavigator)
		forceNavigator.loadCommands(forceNavigatorSettings, true)
		document.getElementById("sfnavQuickSearch").value = ""
	},
	"loadCommands": (settings, force = false) => {
		if([forceNavigator.serverInstance, forceNavigator.organizationId, forceNavigator.sessionId].includes(null))
			return init()
		if(force || Object.keys(forceNavigator.commands).length === 0)
			forceNavigator.resetCommands()
		let options = {
			sessionHash: forceNavigator.sessionHash,
			domain: forceNavigator.serverInstance,
			apiUrl: forceNavigator.apiUrl,
			key: forceNavigator.sessionHash,
			settings: forceNavigatorSettings,
			force: force,
			sessionId: forceNavigator.sessionId
		}
		// chrome.runtime.sendMessage( Object.assign(options, {action:'getSetupTree', settings: forceNavigatorSettings}), response=>{ Object.assign(commands, response) })
		chrome.runtime.sendMessage( Object.assign(options, {action:'getMetadata', settings: forceNavigatorSettings}), response=>Object.assign(commands, response))
		// chrome.runtime.sendMessage( Object.assign(options, {action:'getCustomObjects', settings: forceNavigatorSettings}), response=>{
		// 	Object.assign(commands, response)
		// })
		forceNavigator.otherExtensions.forEach(e=>chrome.runtime.sendMessage(
			Object.assign(options, {action:'getOtherExtensionCommands', otherExtension: e}), response=>Object.assign(forceNavigator.commands, response)
		))
		ui.hideLoadingIndicator()
	},
	"setupLabelsMap": {
		"objects.fieldsAndRelationships": "/FieldsAndRelationships/view",
		"objects.pageLayouts": "/PageLayouts/view",
		"objects.lightningPages": "/LightningPages/view",
		"objects.buttonsLinksActions": "/ButtonsLinksActions/view",
		"objects.compactLayouts": "/CompactLayouts/view",
		"objects.fieldSets": "/FieldSets/view",
		"objects.limits": "/Limits/view",
		"objects.recordTypes": "/RecordTypes/view",
		"objects.relatedLookupFilters": "/RelatedLookupFilters/view",
		"objects.searchLayouts": "/SearchLayouts/view",
		"objects.triggers": "/Triggers/view",
		"objects.lightningPages": "/LightningPages/view",
		"objects.validationRules": "/ValidationRules/view"
	},
	"urlMap": {
		"Home": {
			"lightning": "/lightning/page/home",
			"classic": "//"
		},
		"Setup": {
			"lightning": "",
			"classic": "/ui/setup/Setup"
		},
		"Object Manager": {
			"lightning": "/lightning/setup/ObjectManager/home",
			"classic": "/p/setup/custent/CustomObjectsPage?setupid=CustomObjects&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDevTools"
		},
		"Profiles": {
			"lightning": "/lightning/setup/Profiles/home",
			"classic": "/00e?setupid=EnhancedProfiles&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers"
		},
		"Search Layouts": {
			"lightning": "/lightning/setup/EinsteinSearchLayouts/home",
			"classic": "/lightning/setup/ObjectManager/ContactPointPhone/SearchLayouts/view"
		},
		"Record Types": {
			"lightning": "/lightning/setup/CollaborationGroupRecordTypes/home",
			"classic": "/lightning/setup/ObjectManager/ContactPointAddress/RecordTypes/view"
		},
		"Release Updates": {
			"lightning": "/lightning/setup/ReleaseUpdates/home",
			"classic": "/ui/setup/releaseUpdate/ReleaseUpdatePage?setupid=ReleaseUpdates&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DAdminSetup"
		},
		"Users": {
			"lightning": "/lightning/setup/ManageUsers/home",
			"classic": "/005?isUserEntityOverride=1&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers&setupid=ManageUsers"
		},
		"Roles": {
			"lightning": "/lightning/setup/Roles/home",
			"classic": "/ui/setup/user/RoleViewPage?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers&setupid=Roles"
		},
		"Permission Sets": {
			"lightning": "/lightning/setup/PermSets/home",
			"classic": "/0PS?setupid=PermSets&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers"
		},
		"Permission Set Groups": {
			"lightning": "/lightning/setup/PermSetGroups/home",
			"classic": "/_ui/perms/ui/setup/PermSetGroupsPage?setupid=PermSetGroups&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers"
		},    "Public Groups": {
			"lightning": "/lightning/setup/PublicGroups/home",
			"classic": "/p/own/OrgPublicGroupsPage/d?setupid=PublicGroups&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers"
		},
		"Queues": {
			"lightning": "/lightning/setup/Queues/home",
			"classic": "/p/own/OrgQueuesPage/d?setupid=Queues&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers"
		},
		"Login History": {
			"lightning": "/lightning/setup/OrgLoginHistory/home",
			"classic": "/0Ya?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers&setupid=OrgLoginHistory"
		},
		"Identity Verification History": {
			"lightning": "/lightning/setup/VerificationHistory/home",
			"classic": "/setup/secur/VerificationHistory.apexp?setupid=VerificationHistory&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DUsers"
		},
		"Company Information": {
			"lightning": "/lightning/setup/CompanyProfileInfo/home",
			"classic": "/00D41000000f27H?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCompanyProfile&setupid=CompanyProfileInfo"
		},
		"Fiscal Year": {
			"lightning": "/lightning/setup/ForecastFiscalYear/home",
			"classic": "/setup/org/orgfydetail.jsp?id=00D41000000f27H&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCompanyProfile&setupid=ForecastFiscalYear"
		},
		"Business Hours": {
			"lightning": "/lightning/setup/BusinessHours/home",
			"classic": "/01m?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCompanyProfile&setupid=BusinessHours"
		},
		"Holidays": {
			"lightning": "/lightning/setup/Holiday/home",
			"classic": "/p/case/HolidayList?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCompanyProfile&setupid=Holiday"
		},
		"Language Settings": {
			"lightning": "/lightning/setup/LanguageSettings/home",
			"classic": "/_ui/system/organization/LanguageSettings?setupid=LanguageSettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCompanyProfile"
		},
		"Health Check": {
			"lightning": "/lightning/setup/HealthCheck/home",
			"classic": "/_ui/security/dashboard/aura/SecurityDashboardAuraContainer?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity&setupid=HealthCheck"
		},
		"Sharing Settings": {
			"lightning": "/lightning/setup/SecuritySharing/home",
			"classic": "/p/own/OrgSharingDetail?setupid=SecuritySharing&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity"
		},
		"Field Accessibility": {
			"lightning": "/lightning/setup/FieldAccessibility/home",
			"classic": "/setup/layout/flslayoutjump.jsp?setupid=FieldAccessibility&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity"
		},
		"Login Flows": {
			"lightning": "/lightning/setup/LoginFlow/home",
			"classic": "/0Kq?setupid=LoginFlow&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity"
		},
		"Activations": {
			"lightning": "/lightning/setup/ActivatedIpAddressAndClientBrowsersPage/home",
			"classic": "/setup/secur/identityconfirmation/ActivatedIpAddressAndClientBrowsersPage.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity&setupid=ActivatedIpAddressAndClientBrowsersPage"
		},
		"Session Management": {
			"lightning": "/lightning/setup/SessionManagementPage/home",
			"classic": "/setup/secur/session/SessionManagementPage.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity&setupid=SessionManagementPage"
		},
		"Single Sign-On Settings": {
			"lightning": "/lightning/setup/SingleSignOn/home",
			"classic": "/_ui/identity/saml/SingleSignOnSettingsUi/d?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity&setupid=SingleSignOn"
		},
		"Identity Provider": {
			"lightning": "/lightning/setup/IdpPage/home",
			"classic": "/setup/secur/idp/IdpPage.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity&setupid=IdpPage"
		},
		"View Setup Audit Trail": {
			"lightning": "/lightning/setup/SecurityEvents/home",
			"classic": "/setup/org/orgsetupaudit.jsp?setupid=SecurityEvents&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity"
		},
		"Delegated Administration": {
			"lightning": "/lightning/setup/DelegateGroups/home",
			"classic": "/ui/setup/user/DelegateGroupListPage?setupid=DelegateGroups&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity"
		},
		"Remote Site Settings": {
			"lightning": "/lightning/setup/SecurityRemoteProxy/home",
			"classic": "/0rp?spl1=1&setupid=SecurityRemoteProxy&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity"
		},
		"CSP Trusted Sites": {
			"lightning": "/lightning/setup/SecurityCspTrustedSite/home",
			"classic": "/08y?spl1=1&setupid=SecurityCspTrustedSite&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity"
		},
		"Named Credentials": {
			"lightning": "/lightning/setup/NamedCredential/home",
			"classic": "/0XA?setupid=NamedCredential&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSecurity"
		},
		"Domains": {
			"lightning": "/lightning/setup/DomainNames/home",
			"classic": "/0I4?setupid=DomainNames&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDomains"
		},
		"Custom URLs": {
			"lightning": "/lightning/setup/DomainSites/home",
			"classic": "/0Jf?setupid=DomainSites&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDomains"
		},
		"My Domain": {
			"lightning": "/lightning/setup/OrgDomain/home",
			"classic": "/domainname/DomainName.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDomains&setupid=OrgDomain"
		},
		"Translation Language Settings": {
			"lightning": "/lightning/setup/LabelWorkbenchSetup/home",
			"classic": "/01h?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLabelWorkbench&setupid=LabelWorkbenchSetup"
		},
		"Translate": {
			"lightning": "/lightning/setup/LabelWorkbenchTranslate/home",
			"classic": "/i18n/TranslationWorkbench.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLabelWorkbench&setupid=LabelWorkbenchTranslate"
		},
		"Override": {
			"lightning": "/lightning/setup/LabelWorkbenchOverride/home",
			"classic": "/i18n/LabelWorkbenchOverride.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLabelWorkbench&setupid=LabelWorkbenchOverride"
		},
		"Export": {
			"lightning": "/lightning/setup/LabelWorkbenchExport/home",
			"classic": "/i18n/TranslationExport.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLabelWorkbench&setupid=LabelWorkbenchExport"
		},
		"Import": {
			"lightning": "/lightning/setup/LabelWorkbenchImport/home",
			"classic": "/i18n/TranslationImport.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLabelWorkbench&setupid=LabelWorkbenchImport"
		},
		"Duplicate Error Logs": {
			"lightning": "/lightning/setup/DuplicateErrorLog/home",
			"classic": "/075?setupid=DuplicateErrorLog&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDuplicateManagement"
		},
		"Duplicate Rules": {
			"lightning": "/lightning/setup/DuplicateRules/home",
			"classic": "/0Bm?setupid=DuplicateRules&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDuplicateManagement"
		},
		"Matching Rules": {
			"lightning": "/lightning/setup/MatchingRules/home",
			"classic": "/0JD?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDuplicateManagement&setupid=MatchingRules"
		},
		"Data Integration Rules": {
			"lightning": "/lightning/setup/CleanRules/home",
			"classic": "/07i?setupid=CleanRules&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDataManagement"
		},
		"Data Integration Metrics": {
			"lightning": "/lightning/setup/XCleanVitalsUi/home",
			"classic": "/_ui/xclean/ui/XCleanVitalsUi?setupid=XCleanVitalsUi&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDataManagement"
		},
		"Reporting Snapshots": {
			"lightning": "/lightning/setup/AnalyticSnapshots/home",
			"classic": "/_ui/analytics/jobs/AnalyticSnapshotSplashUi?setupid=AnalyticSnapshots&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDataManagement"
		},
		"Data Import Wizard": {
			"lightning": "/lightning/setup/DataManagementDataImporter/home",
			"classic": "/ui/setup/dataimporter/DataImporterAdminLandingPage?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDataManagement&setupid=DataManagementDataImporter"
		},
		"Salesforce Navigation": {
			"lightning": "/lightning/setup/ProjectOneAppMenu/home",
			"classic": "/setup/salesforce1AppMenu.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DMobileAdministration&setupid=ProjectOneAppMenu"
		},
		"Salesforce Settings": {
			"lightning": "/lightning/setup/Salesforce1Settings/home",
			"classic": "/mobile/mobileadmin/settingsMovedToConnectedApps.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSalesforce1&setupid=Salesforce1Settings"
		},
		"Salesforce Branding": {
			"lightning": "/lightning/setup/Salesforce1Branding/home",
			"classic": "/branding/setup/s1Branding.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSalesforce1&setupid=Salesforce1Branding"
		},
		"Outlook Configurations": {
			"lightning": "/lightning/setup/EmailConfigurations/home",
			"classic": "/063?Type=E&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDesktopAdministration&setupid=EmailConfigurations"
		},
		"Email to Salesforce": {
			"lightning": "/lightning/setup/EmailToSalesforce/home",
			"classic": "/email-admin/services/emailToSalesforceOrgSetup.apexp?mode=detail&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DEmailAdmin&setupid=EmailToSalesforce"
		},
		"Apex Exception Email": {
			"lightning": "/lightning/setup/ApexExceptionEmail/home",
			"classic": "/apexpages/setup/apexExceptionEmail.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DEmailAdmin&setupid=ApexExceptionEmail"
		},
		"Rename Tabs and Labels": {
			"lightning": "/lightning/setup/RenameTab/home",
			"classic": "/ui/setup/RenameTabPage?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DTab&setupid=RenameTab"
		},
		"Maps and Location Settings": {
			"lightning": "/lightning/setup/MapsAndLocationServicesSettings/home",
			"classic": "/maps/mapsAndLocationSvcSettings.apexp?setupid=MapsAndLocationServicesSettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DMapsAndLocationServices"
		},
		"Task Fields": {
			"lightning": "/lightning/setup/ObjectManager/Task/FieldsAndRelationships/view",
			"classic": "/p/setup/layout/LayoutFieldList?type=Task&setupid=TaskFields&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Task Validation Rules": {
			"lightning": "/lightning/setup/ObjectManager/Task/ValidationRules/view",
			"classic": "/_ui/common/config/entity/ValidationFormulaListUI/d?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity&tableEnumOrId=Task&setupid=TaskValidations"
		},
		"Task Triggers": {
			"lightning": "/lightning/setup/ObjectManager/Task/Triggers/view",
			"classic": "/p/setup/layout/ApexTriggerList?type=Task&setupid=TaskTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Task Buttons, Links, and Actions": {
			"lightning": "/lightning/setup/ObjectManager/Task/ButtonsLinksActions/view",
			"classic": "/p/setup/link/ActionButtonLinkList?pageName=Task&type=Task&setupid=TaskLinks&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Task Page Layouts": {
			"lightning": "/lightning/setup/ObjectManager/Task/PageLayouts/view",
			"classic": "/ui/setup/layout/PageLayouts?type=Task&setupid=TaskLayouts&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Task Field Sets": {
			"lightning": "/lightning/setup/ObjectManager/Task/FieldSets/view",
			"classic": "/_ui/common/config/entity/FieldSetListUI/d?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity&tableEnumOrId=Task&setupid=TaskFieldSets"
		},
		"Task Compact Layouts": {
			"lightning": "/lightning/setup/ObjectManager/Task/CompactLayouts/view",
			"classic": "/_ui/common/config/compactlayout/CompactLayoutListUi/d?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity&type=Task&setupid=TaskCompactLayouts"
		},
		"Task Record Types": {
			"lightning": "/lightning/setup/ObjectManager/Task/RecordTypes/view",
			"classic": "/ui/setup/rectype/RecordTypes?type=Task&setupid=TaskRecords&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Task Limits": {
			"lightning": "/lightning/setup/ObjectManager/Task/Limits/view",
			"classic": "/p/setup/custent/EntityLimits?type=Task&setupid=TaskLimits&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Event Fields": {
			"lightning": "/lightning/setup/ObjectManager/Event/FieldsAndRelationships/view",
			"classic": "/p/setup/layout/LayoutFieldList?type=Event&setupid=EventFields&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Event Validation Rules": {
			"lightning": "/lightning/setup/ObjectManager/Event/ValidationRules/view",
			"classic": "/_ui/common/config/entity/ValidationFormulaListUI/d?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity&tableEnumOrId=Event&setupid=EventValidations"
		},
		"Event Triggers": {
			"lightning": "/lightning/setup/ObjectManager/Event/Triggers/view",
			"classic": "/p/setup/layout/ApexTriggerList?type=Event&setupid=EventTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Event Page Layouts": {
			"lightning": "/lightning/setup/ObjectManager/Event/PageLayouts/view",
			"classic": "/ui/setup/layout/PageLayouts?type=Event&setupid=EventLayouts&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Event Field Sets": {
			"lightning": "/lightning/setup/ObjectManager/Event/FieldSets/view",
			"classic": "/_ui/common/config/entity/FieldSetListUI/d?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity&tableEnumOrId=Event&setupid=EventFieldSets"
		},
		"Event Compact Layouts": {
			"lightning": "/lightning/setup/ObjectManager/Event/CompactLayouts/view",
			"classic": "/_ui/common/config/compactlayout/CompactLayoutListUi/d?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity&type=Event&setupid=EventCompactLayouts"
		},
		"Event Record Types": {
			"lightning": "/lightning/setup/ObjectManager/Event/RecordTypes/view",
			"classic": "/ui/setup/rectype/RecordTypes?type=Event&setupid=EventRecords&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Event Limits": {
			"lightning": "/lightning/setup/ObjectManager/Event/Limits/view",
			"classic": "/p/setup/custent/EntityLimits?type=Event&setupid=EventLimits&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Activity Custom Fields": {
			"lightning": "/lightning/setup/ObjectManager/Task/FieldsAndRelationships/view",
			"classic": "/p/setup/layout/LayoutFieldList?type=Activity&setupid=ActivityFields&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity"
		},
		"Public Calendars and Resources": {
			"lightning": "/lightning/setup/Calendars/home",
			"classic": "/023/s?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity&setupid=Calendars"
		},
		"Activity Settings": {
			"lightning": "/lightning/setup/HomeActivitiesSetupPage/home",
			"classic": "/setup/activitiesSetupPage.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DActivity&setupid=HomeActivitiesSetupPage"
		},
		"Auto-Association Settings": {
			"lightning": "/lightning/setup/AutoAssociationSettings/home",
			"classic": "/p/camp/CampaignInfluenceAutoAssociationSetupUi/d?ftype=CampaignInfluence&setupid=AutoAssociationSettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCampaignInfluence2"
		},
		"Campaign Influence Settings": {
			"lightning": "/lightning/setup/CampaignInfluenceSettings/home",
			"classic": "/p/camp/CampaignInfluenceSetupUi/d?setupid=CampaignInfluenceSettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCampaignInfluence2"
		},
		"Lead Assignment Rules": {
			"lightning": "/lightning/setup/LeadRules/home",
			"classic": "/setup/own/entityrulelist.jsp?rtype=1&entity=Lead&setupid=LeadRules&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLead"
		},
		"Lead Settings": {
			"lightning": "/lightning/setup/LeadSettings/home",
			"classic": "/_ui/sales/lead/LeadSetup/d?setupid=LeadSettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLead"
		},
		"Lead Processes": {
			"lightning": "/lightning/setup/LeadProcess/home",
			"classic": "/setup/ui/bplist.jsp?id=00Q&setupid=LeadProcess&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLead"
		},
		"Web-to-Lead": {
			"lightning": "/lightning/setup/LeadWebtoleads/home",
			"classic": "/lead/leadcapture.jsp?setupid=LeadWebtoleads&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLead"
		},
		"Lead Auto-Response Rules": {
			"lightning": "/lightning/setup/LeadResponses/home",
			"classic": "/setup/own/entityrulelist.jsp?rtype=4&entity=Lead&setupid=LeadResponses&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLead"
		},
		"Account Settings": {
			"lightning": "/lightning/setup/AccountSettings/home",
			"classic": "/accounts/accountSetup.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DAccount&setupid=AccountSettings"
		},
		"Notes Settings": {
			"lightning": "/lightning/setup/NotesSetupPage/home",
			"classic": "/setup/notesSetupPage.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DNotes&setupid=NotesSetupPage"
		},
		"Contact Roles on Opportunities": {
			"lightning": "/lightning/setup/OpportunityRoles/home",
			"classic": "/setup/ui/picklist_masterdetail.jsp?tid=00K&pt=11&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DOpportunity&setupid=OpportunityRoles"
		},
		"Sales Processes": {
			"lightning": "/lightning/setup/OpportunityProcess/home",
			"classic": "/setup/ui/bplist.jsp?id=006&setupid=OpportunityProcess&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DOpportunity"
		},
		"Opportunity Settings": {
			"lightning": "/lightning/setup/OpportunitySettings/home",
			"classic": "/setup/opp/oppSettings.jsp?setupid=OpportunitySettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DOpportunity"
		},
		"Path Settings": {
			"lightning": "/lightning/setup/PathAssistantSetupHome/home",
			"classic": "/ui/setup/pathassistant/PathAssistantSetupPage?setupid=PathAssistantSetupHome&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DPathAssistant"
		},
		"Forecasts Settings": {
			"lightning": "/lightning/setup/Forecasting3Settings/home",
			"classic": "/_ui/sales/forecasting/ui/ForecastingSettingsPageAura?setupid=Forecasting3Settings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DForecasting3"
		},
		"Forecasts Hierarchy": {
			"lightning": "/lightning/setup/Forecasting3Role/home",
			"classic": "/ui/setup/forecasting/ForecastingRolePage?setupid=Forecasting3Role&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DForecasting3"
		},
		"Contact Roles on Cases": {
			"lightning": "/lightning/setup/CaseContactRoles/home",
			"classic": "/setup/ui/picklist_masterdetail.jsp?tid=03j&pt=45&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCase&setupid=CaseContactRoles"
		},
		"Case Assignment Rules": {
			"lightning": "/lightning/setup/CaseRules/home",
			"classic": "/setup/own/entityrulelist.jsp?rtype=1&entity=Case&setupid=CaseRules&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCase"
		},
		"Escalation Rules": {
			"lightning": "/lightning/setup/CaseEscRules/home",
			"classic": "/setup/own/entityrulelist.jsp?rtype=3&entity=Case&setupid=CaseEscRules&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCase"
		},
		"Support Processes": {
			"lightning": "/lightning/setup/CaseProcess/home",
			"classic": "/setup/ui/bplist.jsp?id=500&setupid=CaseProcess&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCase"
		},
		"Support Settings": {
			"lightning": "/lightning/setup/CaseSettings/home",
			"classic": "/_ui/support/organization/SupportOrganizationSetupUi/d?setupid=CaseSettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCase"
		},
		"Case Auto-Response Rules": {
			"lightning": "/lightning/setup/CaseResponses/home",
			"classic": "/setup/own/entityrulelist.jsp?rtype=4&entity=Case&setupid=CaseResponses&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCase"
		},
		"Email-to-Case": {
			"lightning": "/lightning/setup/EmailToCase/home",
			"classic": "/ui/setup/email/EmailToCaseSplashPage?setupid=EmailToCase&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCase"
		},
		"Feed Filters": {
			"lightning": "/lightning/setup/FeedFilterDefinitions/home",
			"classic": "/_ui/common/feedfilter/setup/ui/FeedFilterListPage/d?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCase&context=Case&setupid=FeedFilterDefinitions"
		},
		"Case Team Roles": {
			"lightning": "/lightning/setup/CaseTeamRoles/home",
			"classic": "/0B7?kp=500&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCaseTeams&setupid=CaseTeamRoles"
		},
		"Predefined Case Teams": {
			"lightning": "/lightning/setup/CaseTeamTemplates/home",
			"classic": "/0B4?kp=500&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCaseTeams&setupid=CaseTeamTemplates"
		},
		"Case Comment Triggers": {
			"lightning": "/lightning/setup/CaseCommentTriggers/home",
			"classic": "/p/setup/layout/ApexTriggerList?type=CaseComment&setupid=CaseCommentTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCaseComment"
		},
		"Web-to-Case": {
			"lightning": "/lightning/setup/CaseWebtocase/home",
			"classic": "/cases/webtocasesetup.jsp?setupid=CaseWebtocase&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSelfService"
		},
		"Web-to-Case HTML Generator": {
			"lightning": "/lightning/setup/CaseWebToCaseHtmlGenerator/home",
			"classic": "/_ui/common/config/entity/WebToCaseUi/e?setupid=CaseWebToCaseHtmlGenerator&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSelfService"
		},
		"Macro Settings": {
			"lightning": "/lightning/setup/MacroSettings/home",
			"classic": "/_ui/support/macros/MacroSettings/d?setupid=MacroSettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DMacro"
		},
		"Contact Roles on Contracts": {
			"lightning": "/lightning/setup/ContractContactRoles/home",
			"classic": "/setup/ui/picklist_masterdetail.jsp?tid=02a&pt=39&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DContract&setupid=ContractContactRoles"
		},
		"Contract Settings": {
			"lightning": "/lightning/setup/ContractSettings/home",
			"classic": "/ctrc/contractsettings.jsp?setupid=ContractSettings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DContract"
		},
		"Order Settings": {
			"lightning": "/lightning/setup/OrderSettings/home",
			"classic": "/oe/orderSettings.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DOrder&setupid=OrderSettings"
		},
		"Product Schedules Settings": {
			"lightning": "/lightning/setup/Product2ScheduleSetup/home",
			"classic": "/setup/pbk/orgAnnuityEnable.jsp?setupid=Product2ScheduleSetup&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DProducts"
		},
		"Product Settings": {
			"lightning": "/lightning/setup/Product2Settings/home",
			"classic": "/setup/pbk/productSettings.jsp?setupid=Product2Settings&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DProducts"
		},
		"Asset Files": {
			"lightning": "/lightning/setup/ContentAssets/home",
			"classic": "/03S?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DSalesforceFiles&setupid=ContentAssets"
		},
		"Chatter Settings": {
			"lightning": "/lightning/setup/CollaborationSettings/home",
			"classic": "/collaboration/collaborationSettings.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCollaboration&setupid=CollaborationSettings"
		},
		"Publisher Layouts": {
			"lightning": "/lightning/setup/GlobalPublisherLayouts/home",
			"classic": "/ui/setup/layout/PageLayouts?type=Global&setupid=GlobalPublisherLayouts&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DGlobalActions"
		},
		"Feed Tracking": {
			"lightning": "/lightning/setup/FeedTracking/home",
			"classic": "/feeds/feedTracking.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCollaboration&setupid=FeedTracking"
		},
		"Email Settings": {
			"lightning": "/lightning/setup/ChatterEmailSettings/home",
			"classic": "/_ui/core/chatter/email/ui/ChatterEmailSettings/e?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCollaboration&setupid=ChatterEmailSettings"
		},
		"Feed Item Layouts": {
			"lightning": "/lightning/setup/FeedItemLayouts/home",
			"classic": "/ui/setup/layout/PageLayouts?type=FeedItem&setupid=FeedItemLayouts&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DFeedItemActionConfig"
		},
		"Feed Item Actions": {
			"lightning": "/lightning/setup/FeedItemActions/home",
			"classic": "/p/setup/link/ActionButtonLinkList?pageName=FeedItem&type=FeedItem&setupid=FeedItemActions&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DFeedItemActionConfig"
		},
		"FeedComment Triggers": {
			"lightning": "/lightning/setup/FeedCommentTriggers/home",
			"classic": "/p/setup/layout/ApexTriggerList?type=FeedComment&setupid=FeedCommentTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DFeedTriggers"
		},
		"FeedItem Triggers": {
			"lightning": "/lightning/setup/FeedItemTriggers/home",
			"classic": "/p/setup/layout/ApexTriggerList?type=FeedItem&setupid=FeedItemTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DFeedTriggers"
		},
		"Group Triggers": {
			"lightning": "/lightning/setup/CollaborationGroupTriggers/home",
			"classic": "/p/setup/layout/ApexTriggerList?type=CollaborationGroup&setupid=CollaborationGroupTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCollaborationGroup"
		},
		"Group Member Triggers": {
			"lightning": "/lightning/setup/CollaborationGroupMemberTriggers/home",
			"classic": "/p/setup/layout/ApexTriggerList?type=CollaborationGroupMember&setupid=CollaborationGroupMemberTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCollaborationGroup"
		},
		"Group Record Triggers": {
			"lightning": "/lightning/setup/CollaborationGroupRecordTriggers/home",
			"classic": "/p/setup/layout/ApexTriggerList?type=CollaborationGroupRecord&setupid=CollaborationGroupRecordTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCollaborationGroup"
		},
		"Group Layouts": {
			"lightning": "/lightning/setup/CollaborationGroupLayouts/home",
			"classic": "/ui/setup/layout/PageLayouts?type=CollaborationGroup&setupid=CollaborationGroupLayouts&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DCollaborationGroup"
		},
		"Topic Triggers": {
			"lightning": "/lightning/setup/TopicTriggers/home",
			"classic": "/p/setup/layout/ApexTriggerList?type=Topic&setupid=TopicTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DTopic"
		},
		"Topic Assignment Triggers": {
			"lightning": "/lightning/setup/TopicAssigmentTriggers/home",
			"classic": "/p/setup/layout/ApexTriggerList?type=TopicAssignment&setupid=TopicAssigmentTriggers&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DTopic"
		},
		"Enhanced Email": {
			"lightning": "/lightning/setup/EnhancedEmail/home",
			"classic": "/ui/setup/email/EnhancedEmailSetupPage?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DEmailExperience&setupid=EnhancedEmail"
		},
		"Individual Settings": {
			"lightning": "/lightning/setup/IndividualSettings/home",
			"classic": "/individual/individualSetup.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DIndividual&setupid=IndividualSettings"
		},
		"Custom Labels": {
			"lightning": "/lightning/setup/ExternalStrings/home",
			"classic": "/101?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDevTools&setupid=ExternalStrings"
		},
		"Big Objects": {
			"lightning": "/lightning/setup/BigObjects/home",
			"classic": "/p/setup/custent/BigObjectsPage?setupid=BigObjects&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDevTools"
		},
		"Picklist Value Sets": {
			"lightning": "/lightning/setup/Picklists/home",
			"classic": "/_ui/platform/ui/schema/wizard/picklist/PicklistsPage?setupid=Picklists&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDevTools"
		},
		"Report Types": {
			"lightning": "/lightning/setup/CustomReportTypes/home",
			"classic": "/070?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDevTools&setupid=CustomReportTypes"
		},
		"Tabs": {
			"lightning": "/lightning/setup/CustomTabs/home",
			"classic": "/setup/ui/customtabs.jsp?setupid=CustomTabs&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDevTools"
		},
		"Global Actions": {
			"lightning": "/lightning/setup/GlobalActions/home",
			"classic": "/p/setup/link/ActionButtonLinkList?pageName=Global&type=Global&setupid=GlobalActionLinks&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DGlobalActions"
		},
		"Workflow Rules": {
			"lightning": "/lightning/setup/WorkflowRules/home",
			"classic": "/_ui/core/workflow/WorkflowSplashUi?EntityId=WorkflowRule&setupid=WorkflowRules&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow"
		},
		"Approval Processes": {
			"lightning": "/lightning/setup/ApprovalProcesses/home",
			"classic": "/p/process/ProcessDefinitionSetup?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow&setupid=ApprovalProcesses"
		},
		"Flows": {
			"lightning": "/lightning/setup/Flows/home",
			"classic": "/300?setupid=InteractionProcesses&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow"
		},
		"Tasks": {
			"lightning": "/lightning/setup/WorkflowTasks/home",
			"classic": "/_ui/core/workflow/WorkflowSplashUi?EntityId=ActionTask&setupid=WorkflowTasks&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow"
		},
		"Email Alerts": {
			"lightning": "/lightning/setup/WorkflowEmails/home",
			"classic": "/_ui/core/workflow/WorkflowSplashUi?EntityId=ActionEmail&setupid=WorkflowEmails&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow"
		},
		"Field Updates": {
			"lightning": "/lightning/setup/WorkflowFieldUpdates/home",
			"classic": "/_ui/core/workflow/WorkflowSplashUi?EntityId=ActionFieldUpdate&setupid=WorkflowFieldUpdates&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow"
		},
		"Outbound Messages": {
			"lightning": "/lightning/setup/WorkflowOutboundMessaging/home",
			"classic": "/ui/setup/outbound/WfOutboundStatusUi?setupid=WorkflowOmStatus&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DMonitoring"
		},
		"Send Actions": {
			"lightning": "/lightning/setup/SendAction/home",
			"classic": "/07V?setupid=SendAction&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow"
		},
		"Post Templates": {
			"lightning": "/lightning/setup/FeedTemplates/home",
			"classic": "/07D?setupid=FeedTemplates&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow"
		},
		"Process Automation Settings": {
			"lightning": "/lightning/setup/WorkflowSettings/home",
			"classic": "/_ui/core/workflow/WorkflowSettingsUi?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DWorkflow&setupid=WorkflowSettings"
		},
		"Apex Classes": {
			"lightning": "/lightning/setup/ApexClasses/home",
			"classic": "/01p?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=ApexClasses"
		},
		"Apex Triggers": {
			"lightning": "/lightning/setup/ApexTriggers/home",
			"classic": "/setup/build/allTriggers.apexp?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=ApexTriggers"
		},
		"Apex Test Execution": {
			"lightning": "/lightning/setup/ApexTestQueue/home",
			"classic": "/ui/setup/apex/ApexTestQueuePage?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=ApexTestQueue"
		},
		"Apex Hammer Test Results": {
			"lightning": "/lightning/setup/ApexHammerResultStatus/home",
			"classic": "/ui/setup/apex/ApexHammerResultStatusLandingPage?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=ApexHammerResultStatus"
		},
		"API": {
			"lightning": "/lightning/setup/WebServices/home",
			"classic": "/ui/setup/sforce/WebServicesSetupPage?setupid=WebServices&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"Visualforce Components": {
			"lightning": "/lightning/setup/ApexComponents/home",
			"classic": "/apexpages/setup/listApexComponent.apexp?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=ApexComponents"
		},
		"Change Data Capture": {
			"lightning": "/lightning/setup/CdcObjectEnablement/home",
			"classic": "/ui/setup/cdc/CdcObjectEnablementPage?setupid=CdcObjectEnablement&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"Custom Permissions": {
			"lightning": "/lightning/setup/CustomPermissions/home",
			"classic": "/0CP?setupid=CustomPermissions&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"Custom Metadata Types": {
			"lightning": "/lightning/setup/CustomMetadata/home",
			"classic": "/_ui/platform/ui/schema/wizard/entity/CustomMetadataTypeListPage?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=CustomMetadata"
		},
		"Custom Settings": {
			"lightning": "/lightning/setup/CustomSettings/home",
			"classic": "/setup/ui/listCustomSettings.apexp?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=CustomSettings"
		},
		"Dev Hub": {
			"lightning": "/lightning/setup/DevHub/home",
			"classic": "/ui/setup/sfdx/SomaSetupPage?setupid=DevHub&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"Lightning Components": {
			"lightning": "/lightning/setup/LightningComponentBundles/home",
			"classic": "/ui/aura/impl/setup/LightningComponentListPage?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLightningComponents&setupid=LightningComponentBundles"
		},
		"Debug Mode": {
			"lightning": "/lightning/setup/UserDebugModeSetup/home",
			"classic": "/ui/aura/impl/setup/UserDebugModeSetupPage?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DLightningComponents&setupid=UserDebugModeSetup"
		},
		"Visualforce Pages": {
			"lightning": "/lightning/setup/ApexPages/home",
			"classic": "/apexpages/setup/listApexPage.apexp?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=ApexPages"
		},
		"Platform Cache": {
			"lightning": "/lightning/setup/PlatformCache/home",
			"classic": "/0Er?setupid=PlatformCache&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"Sites": {
			"lightning": "/lightning/setup/CustomDomain/home",
			"classic": "/0DM/o?setupid=CustomDomain&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"Static Resources": {
			"lightning": "/lightning/setup/StaticResources/home",
			"classic": "/apexpages/setup/listStaticResource.apexp?retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate&setupid=StaticResources"
		},
		"Tools": {
			"lightning": "/lightning/setup/ClientDevTools/home",
			"classic": "/ui/setup/sforce/ClientDevToolsSetupPage?setupid=ClientDevTools&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"External Data Sources": {
			"lightning": "/lightning/setup/ExternalDataSource/home",
			"classic": "/0XC?setupid=ExternalDataSource&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"External Objects": {
			"lightning": "/lightning/setup/ExternalObjects/home",
			"classic": "/p/setup/custent/ExternalObjectsPage?setupid=ExternalObjects&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"Platform Events": {
			"lightning": "/lightning/setup/EventObjects/home",
			"classic": "/p/setup/custent/EventObjectsPage?setupid=EventObjects&retURL=%2Fsetup%2Fintegratesplash.jsp%3Fsetupid%3DDevToolsIntegrate%26retURL%3D%252Fui%252Fsetup%252FSetup%253Fsetupid%253DDevToolsIntegrate"
		},
		"Lightning App Builder": {
			"lightning": "/lightning/setup/FlexiPageList/home",
			"classic": "/_ui/flexipage/ui/FlexiPageFilterListPage?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DStudio&setupid=FlexiPageList"
		},
		"Installed Packages": {
			"lightning": "/lightning/setup/ImportedPackage/home",
			"classic": "/0A3?setupid=ImportedPackage&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DStudio"
		},
		"Package Usage": {
			"lightning": "/lightning/setup/PackageUsageSummary/home",
			"classic": "/_ui/isvintel/ui/PackageUsageSummarySetupPage?setupid=PackageUsageSummary&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DStudio"
		},
		"AppExchange Marketplace": {
			"lightning": "/lightning/setup/AppExchangeMarketplace/home",
			"classic": "/packaging/viewAEMarketplace.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DStudio&setupid=AppExchangeMarketplace"
		},
		"Sandboxes": {
			"lightning": "/lightning/setup/DataManagementCreateTestInstance/home",
			"classic": "/07E?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DDeploy&setupid=DataManagementCreateTestInstance"
		},
		"Scheduled Jobs": {
			"lightning": "/lightning/setup/ScheduledJobs/home",
			"classic": "/08e?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DJobs&setupid=ScheduledJobs"
		},
		"Apex Jobs": {
			"lightning": "/lightning/setup/AsyncApexJobs/home",
			"classic": "/apexpages/setup/listAsyncApexJobs.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DJobs&setupid=AsyncApexJobs"
		},
		"Apex Flex Queue": {
			"lightning": "/lightning/setup/ApexFlexQueue/home",
			"classic": "/apexpages/setup/viewApexFlexQueue.apexp?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DJobs&setupid=ApexFlexQueue"
		},
		"Background Jobs": {
			"lightning": "/lightning/setup/ParallelJobsStatus/home",
			"classic": "/0Ys?retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DJobs&setupid=ParallelJobsStatus"
		},
		"Data Export": {
			"lightning": "/lightning/setup/DataManagementExport/home",
			"classic": "chrome-extension://aodjmnfhjibkcdimpodiifdjnnncaafh/data-export.html?host=jstart.my.salesforce.com"
		}
	}
}