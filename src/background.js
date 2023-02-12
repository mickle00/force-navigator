import { forceNavigator, forceNavigatorSettings } from "./shared"
import { t } from "lisan"
const metaData = {}

const showElement = (element)=>{
	chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
		switch(element) {
			case "appMenu":
				chrome.tabs.executeScript(tabs[0].id, {code: 'document.getElementsByClassName("appLauncher")[0].getElementsByTagName("button")[0].click()'})
				break
			case "searchBox":
				chrome.tabs.executeScript(tabs[0].id, {code: `
					if(document.getElementById("sfnavSearchBox")) {
						document.getElementById("sfnavSearchBox").style.zIndex = 9999
						document.getElementById("sfnavSearchBox").style.opacity = 0.98
						document.getElementById("sfnavQuickSearch").focus()
					}
				`})
				break
		}
	})
}
const getOtherExtensionCommands = (otherExtension, requestDetails, settings = {}, sendResponse)=>{
	const url = requestDetails.domain.replace(/https*:\/\//, '')
	const apiUrl = requestDetails.apiUrl
	let commands = {}
	if(chrome.management) {
		chrome.management.get(otherExtension.id, response => {
			if(chrome.runtime.lastError) { console.debug("Extension not found", chrome.runtime.lastError); return }
			otherExtension.commands.forEach(c=>{
				forceNavigator.commands[otherExtension.name + ' > ' + c.label] = {
					"url": otherExtension.platform + "://" + otherExtension.urlId + c.url.replace("$URL",url).replace("$APIURL",apiUrl),
					"label": otherExtension.name + ' > ' + c.label,
					"key": otherExtension.key
				}
			})
			sendResponse(commands)
		})
	}
}

const parseMetadata = (data, url, settings = {})=>{
	const skipObjects = ["0DM"]
	if (data.length == 0 || typeof data.sobjects == "undefined") return false
	let mapKeys = Object.keys(forceNavigator.objectSetupLabelsMap)
	return data.sobjects.reduce((commands, { labelPlural, label, name, keyPrefix }) => {
		if (!keyPrefix || skipObjects.includes(keyPrefix)) { return commands }
		let baseUrl = "/";
		if (forceNavigatorSettings.lightningMode && name.endsWith("__mdt")) { baseUrl += "lightning/setup/CustomMetadata/page?address=" }
		commands[keyPrefix + ".list"] = {
			"key": keyPrefix + ".list",
			"url": `${baseUrl}/${keyPrefix}`,
			"label": t("prefix.list") + " " + labelPlural
		}
		commands[keyPrefix + ".new"] = {
			"key": keyPrefix + ".new",
			"url": `${baseUrl}/${keyPrefix}/e`,
			"label": t("prefix.new") + " " + label
		}
		if(forceNavigatorSettings.lightningMode) {
			let targetUrl = url + "/lightning/setup/ObjectManager/" + name
			mapKeys.forEach(key=>{
				commands[keyPrefix + "." + key] = {
					"key": keyPrefix + "." + key,
					"url": targetUrl + forceNavigator.objectSetupLabelsMap[key],
					"label": [t("prefix.setup"), label, t(key)].join(" > ")
				}
			})
		} else {
			// figure out how to get the url for Classic
			commands[t("prefix.setup") + label] = { "url": keyPrefix, "key": key}
		}
		return commands
	}, {})
}

const goToUrl = (targetUrl, newTab, settings = {})=>{
	chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
		const re = new RegExp("\\w+-extension:\/\/"+chrome.runtime.id,"g");
		targetUrl = targetUrl.replace(re,'')
		let newUrl = targetUrl.match(/.*?\.com(.*)/)
		newUrl = newUrl ? newUrl[1] : targetUrl
		if(!targetUrl.includes('-extension:'))
			newUrl = tabs[0].url.match(/.*?\.com/)[0] + newUrl
		else
			newUrl = targetUrl
		if(newTab)
			chrome.tabs.create({ active: false, url: newUrl })
		else
			chrome.tabs.update(tabs[0].id, { url: newUrl })
	})
}

chrome.commands.onCommand.addListener((command)=>{
	switch(command) {
		case 'showSearchBox': showElement("searchBox"); break
		case 'showAppMenu': showElement("appMenu"); break
		case 'goToTasks': goToUrl(".com/00T"); break
		case 'goToReports': goToUrl(".com/00O"); break
	}
})
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
	var orgKey = request.key !== null ? request.key?.split('!')[0] : request.key
	switch(request.action) {
		case "goToUrl": goToUrl(request.url, request.newTab, request.settings); break
		case "getOtherExtensionCommands":
			getOtherExtensionCommands(request.otherExtension, request, request.settings, sendResponse)
			break
		case "getApiSessionId":
			if (request.key === null) { sendResponse({error: "Must include orgId"}); return }
			request.sid = request.uid = request.domain = ""
			chrome.cookies.getAll({}, (all)=>{
				all.forEach((c)=>{
					if(c.domain.includes("salesforce.com") && c.value.includes(request.key) && c.name === "sid") {
						request.sid = c.value
						request.domain = c.domain
					}
				})
				if(request.sid === "") { sendResponse({error: "No session data found for " + request.key}); return }
				forceNavigator.getHTTP("https://" + request.domain + '/services/data/' + forceNavigator.apiVersion, "json",
					{"Authorization": "Bearer " + request.sid, "Accept": "application/json"}
				).then(response => {
					if(response?.identity) {
						request.uid = response.identity.match(/005.*/)[0]
						sendResponse({sessionId: request.sid, userId: request.uid, apiUrl: request.domain})
					}
					else sendResponse({error: "No user data found for " + request.key})
				})
			})
			break
		// case 'getSetupTree':
		// 	if(setupTree[request.sessionHash] == null || request.force)
		// 		forceNavigator.getHTTP("https://" + request.apiUrl + "/ui/setup/Setup", "document").then(response => {
		// 			setupTree[request.sessionHash] = parseSetupTree(response, request.domain, request.settings)
		// 			sendResponse(setupTree[request.sessionHash])
		// 		})
		// 	else
		// 		sendResponse(setupTree[request.sessionHash])
		// 	break
		case 'getMetadata':
			if(metaData[request.sessionHash] == null || request.force)
				forceNavigator.getHTTP("https://" + request.apiUrl + '/services/data/' + forceNavigator.apiVersion + '/sobjects/', "json",
					{"Authorization": "Bearer " + request.sessionId, "Accept": "application/json"})
					.then(response => {
						metaData[request.sessionHash] = parseMetadata(response, request.domain, request.settings)
						sendResponse(metaData[request.sessionHash])
					})
			else
				sendResponse(metaData[request.sessionHash])
			break
		case 'createTask':
			forceNavigator.getHTTP("https://" + request.apiUrl + "/services/data/" + forceNavigator.apiVersion + "/sobjects/Task",
				"json", {"Authorization": "Bearer " + request.sessionId, "Content-Type": "application/json" },
				{"Subject": request.subject, "OwnerId": request.userId}, "POST")
			.then(function (response) { sendResponse(response) })
			break
		case 'searchLogins':
			forceNavigator.getHTTP("https://" + request.apiUrl + "/services/data/" + forceNavigator.apiVersion + "/tooling/query/?q=SELECT+Id,+Name,+Username+FROM+User+WHERE+Name+LIKE+'%25" + request.searchValue + "%25'+OR+Username+LIKE+'%25" + request.searchValue + "%25'", "json", {"Authorization": "Bearer " + request.sessionId, "Content-Type": "application/json" })
			.then(function(success) { sendResponse(success) }).catch(function(error) {
				console.log(error)
			})
	}
	return true
})