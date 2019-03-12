var commands = {}
var lastUpdated = {}
const SFAPI_VERSION = 'v40.0'

var showElement = (element)=>{
	chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
		switch(element) {
			case "appMenu":
				chrome.tabs.executeScript(tabs[0].id, {code: 'document.getElementsByClassName("appLauncher")[0].getElementsByTagName("button")[0].click()'})
				break
			case "searchBox":
				chrome.tabs.executeScript(tabs[0].id, {code: `
					document.getElementById("sfnav_searchBox").style.zIndex = 9999
					document.getElementById("sfnav_searchBox").style.opacity = 0.98
					document.getElementById("sfnav_quickSearch").focus()
				`})
				break
		}
	})
}
let getHTTP = function(targetUrl, type = "json", headers = {}, data = {}, method = "GET") {
	let request = { method: method, headers: headers }
	if(Object.keys(data).length > 0)
		request.body = JSON.stringify(data)
	return fetch(targetUrl, request).then(response => {
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
}
var goToUrl = (targetUrl, newTab)=>{
	chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
		targetUrl = tabs[0].url.match(/.*\.com/)[0] + targetUrl.match(/.*\.com(.*)/)[1]
		if(newTab)
			chrome.tabs.create({active: false, url: targetUrl})
		else
			chrome.tabs.update(tabs[0].id, {url: targetUrl})
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
	var orgKey = request.key != null ? request.key.split('!')[0] : request.key
	if (request.action == "getApiSessionId") {
		if (request.key != null) {
			request.sid = request.uid = request.domain = ""
			chrome.cookies.getAll({}, (all)=>{
				all.forEach((c)=>{
					if(c.domain.includes("salesforce.com") && c.value.includes(request.key) && c.name == "sid") {
						request.sid = c.value
						request.domain = c.domain
					}
				})
				if(request.sid != "") {
					getHTTP("https://" + request.domain + '/services/data/' + SFAPI_VERSION, "json",
						{"Authorization": "Bearer " + request.sid, "Accept": "application/json"}
					).then(response => {
						request.uid = response.identity.match(/005.*/)[0]
						sendResponse({sessionId: request.sid, userId: request.uid, classicURL: request.domain})
					})
				}
				else sendResponse({error: "No session data found for " + request.key})
				return request
			})
		} else sendResponse({error: "Must include orgId"})
	}
	switch(request.action) {
		case 'goToUrl': goToUrl(request.url, request.newTab); break
		case 'getOrgCommands': sendResponse(commands[request.key]); break
		case 'storeOrgCommands':
			Object.keys(lastUpdated).forEach((key)=>{
				if(key != request.key && key.split('!')[0] == orgKey) {
					if(commands[key] != null) delete commands[key]
					if(lastUpdated[key] != null) delete lastUpdated[key]
				}
			})
			commands[request.key] = request.payload
			lastUpdated[request.key] = new Date()
			sendResponse({lastUpdated: lastUpdated[request.key]})
			break
		case 'clearCommands':
			if(commands[request.key]) delete commands[request.key]
			if(lastUpdated[request.key]) delete lastUpdated[request.key]
			sendResponse({})
			break
	}
	return true
})