var commands = {}
var metadata = {}
var lastUpdated = {}
chrome.browserAction.setPopup({ popup: "popup.html" })
chrome.runtime.onInstalled.addListener(function(info) {})
chrome.browserAction.onClicked.addListener(function() { chrome.browserAction.setPopup({ popup: "popup.html" }) })

var showElement = function(element) {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
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
var goToUrl = function(targetUrl, newTab) {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		targetUrl = tabs[0].url.match(/.*\.com/)[0] + targetUrl.match(/.*\.com(.*)/)[1]
		if(newTab)
			chrome.tabs.create({active: false, url: targetUrl})
		else
			chrome.tabs.update(tabs[0].id, {url: targetUrl})
	})
}
chrome.commands.onCommand.addListener(function(command) {
	switch(command) {
		case 'showSearchBox': showElement("searchBox"); break
		case 'showAppMenu': showElement("appMenu"); break
		case 'goToTasks': goToUrl(".com/00T"); break
		case 'goToReports': goToUrl(".com/00O"); break
	}
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var orgKey = request.key != null ? request.key.split('!')[0] : request.key
	if (request.action == 'Get API Session ID') {
		if (request.key != null) {
		request.sid = request.uid = request.domain = ""
		chrome.cookies.getAll({}, function(all) {
			all.forEach(function(c) {
				if(c.domain.includes("salesforce.com") && c.value.includes(request.key)) {
				if(c.name == 'sid') {
					request.sid = c.value
					request.domain = c.domain
				}
				else if(c.name == 'disco')
					request.uid = c.value.match(/005[\w\d]+/)[0]
				}
			})
			if(request.sid != "" || request.uid != "")
				sendResponse({sessionId: request.sid, userId: request.uid, classicURL: request.domain})
			else
				sendResponse({error: "No session data found for " + request.key})
			return request
			})
		} else { sendResponse({error: "Must include orgId"}) }
	}

	switch(request.action) {
		case 'goToUrl': goToUrl(request.url, request.newTab); break
		case 'Store Commands':
			Object.keys(lastUpdated).forEach(function(key) {
				if(key != request.key && key.split('!')[0] == orgKey) {
					// might want to check this for multi-org setups
					delete commands[key]
					delete lastUpdated[key]
				}
			})
			commands[request.key] = request.payload
			lastUpdated[request.key] = new Date()
			sendResponse({lastUpdated: lastUpdated[request.key]})
			break
		case 'Get Commands': sendResponse(commands[request.key]); break
		case 'Clear Commands':
			delete commands[request.key]
			delete lastUpdated[request.key]
			sendResponse({})
			break
		case 'Store Metadata':
			Object.keys(metadata).forEach(function(key) {
				if (key != request.key && key.split('!')[0] == orgKey)
					delete metadata[key]
			})
			metadata[request.key] = metadata[orgKey] = request.payload
			sendResponse({})
			break
		case 'Get Metadata':
			if (metadata[request.key] != null)
				sendResponse(metadata[request.key])
			else
				sendResponse(metadata[orgKey])
			break
	}
	return true
})

// else if (request.action == 'Set Settings') {
// 	var settings = localStorage.getItem('sfnav_settings');
// 	if (settings != null) {
// 		var sett = JSON.parse(settings);
// 		let payloadKeys = Object.keys(request.payload)
// 		for (var i = 0; i < payloadKeys.length; i++) {
// 		key = payloadKeys[i]
// 		sett[key] = request.payload[key]
// 		}
// 		localStorage.setItem('sfnav_settings', JSON.stringify(sett))
// 	}
// 	commands = lastUpdated = {}
// 	sendResponse({});
// }
// else if (request.action == 'Get Settings') {
// 	var settings = localStorage.getItem('sfnav_settings')
// 	if (settings != null) { sendResponse(JSON.parse(settings))
// 	} else {
// 		localStorage.setItem('sfnav_settings', JSON.stringify({'shortcut': 'ctrl+shift+space'}))
// 		sendResponse({'shortcut': 'ctrl+shift+space'})
// 	}
// }
