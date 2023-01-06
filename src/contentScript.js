import { forceNavigator, forceNavigatorSettings } from "./shared"
import { t } from "lisan"

const goToUrl = (url, newTab, settings)=>chrome.runtime.sendMessage({
	action: "goToUrl",
	url: url,
	newTab: newTab,
	settings: Object.assign(forceNavigatorSettings, {
			serverInstance: forceNavigator.serverInstance,
			lightningMode: forceNavigatorSettings.lightningMode
		})
	},
	response=>{})

const searchTerms = (terms)=>{
	let targetUrl = serverInstance
	targetUrl += (!forceNavigatorSettings.lightningMode)
	? "/_ui/search/ui/UnifiedSearchResults?sen=ka&sen=500&str=" + encodeURI(terms) + "#!/str=" + encodeURI(terms) + "&searchAll=true&initialViewMode=summary"
	: "/one/one.app#" + btoa(JSON.stringify({
		"componentDef":"forceSearch:search",
		"attributes":{
			"term": terms,
			"scopeMap": { "type":"TOP_RESULTS" },
			"context":{
				"disableSpellCorrection":false,
				"SEARCH_ACTIVITY": {"term": terms}
			}
		}
	}))
	return targetUrl
}
const pasteFromClipboard = (newtab)=>{
	let cb = document.createElement("textarea")
	let body = document.getElementsByTagName('body')[0]
	body.appendChild(cb)
	cb.select()
	document.execCommand('paste')
	const clipboardValue = cb.value.trim()
	cb.remove()
	return clipboardValue
}
const getIdFromUrl = ()=>{
	const url = document.location.href
	const ID_RE = [
		/http[s]?\:\/\/.*force\.com\/.*([a-zA-Z0-9]{18})[^\w]*/, // tries to find the first 18 digit
		/http[s]?\:\/\/.*force\.com\/.*([a-zA-Z0-9]{15})[^\w]*/ // falls back to 15 digit
	]
	for(let i in ID_RE)
		if (url.match(ID_RE[i]) != null) { return match[1] }
	return false
}
const launchMerger = (otherId, object)=>{
		if(!otherId)
			otherId = pasteFromClipboard()
		if(![15,18].includes(otherId.length)) {
			clearOutput()
			addWord(t("commands.errorAccountMerge"))
			return
		}
		const thisId = getIdFromUrl()
		if(!thisId)
			return
		switch(object) {
			case "Account":
				document.location.href = `${forceNavigator.serverInstance}/merge/accmergewizard.jsp?goNext=+Next+&cid=${otherId}&cid=${thisId}`
				break
			default:
				break
		}
	}
const launchMergerAccounts = (otherId)=>launchMerger(otherId, "Account")
const launchMergerCases = (otherId)=>launchMerger(otherId, "Case")
const createTask = (subject)=>{
	showLoadingIndicator()
	if(["",null,undefined].includes(subject) && !forceNavigator.userId) { console.error("Empty Task subject"); hideLoadingIndicator(); return }
	chrome.runtime.sendMessage({
			"action":'createTask', "apiUrl": forceNavigator.apiUrl,
			"key": forceNavigator.sessionHash, "sessionId": forceNavigator.sessionId,
			"domain": forceNavigator.serverInstance, "sessionHash": forceNavigator.sessionHash,
			"subject": subject, "userId": forceNavigator.userId
		}, response=>{
			if(response.errors.length != 0) { console.error("Error creating task", response.errors); return }
			clearOutput()
			commands[t("commands.goToTask")] = {
				"key": "commands.goToTask",
				"url": forceNavigator.serverInstance + "/"+ response.id
			}
			document.getElementById("sfnavQuickSearch").value = ""
			addWord(t("commands.goToTask"))
			addWord(t("commands.escapeCommand"))
			let firstEl = document.querySelector('#sfnavOutputs :first-child')
			if(listPosition == -1 && firstEl != null)
				firstEl.className = "sfnav_child sfnav_selected"
			hideLoadingIndicator()
	})
}

const invokeCommand = (command, newTab, event)=>{
	if(!command) { return false }
	let targetUrl = ""
	switch(command.key) {
		case "commands.refreshMetadata":
			refreshAndClear()
			break
		case "commands.objectManager":
			targetUrl = forceNavigator.serverInstance + "/lightning/setup/ObjectManager/home"
			break
		case "switch to classic":
		case "switch to lightning":
		case "commands.toggleLightning":
			let mode = forceNavigatorSettings.lightningMode ? "classic" : "lex-campaign"
			forceNavigatorSettings.lightningMode = mode === "lex-campaign"
// need to test updating this right
			matchUrl = window.location.href.replace(forceNavigator.serverInstance,"")
			targetUrl = forceNavigator.serverInstance + matchUrl
			forceNavigatorSettings.set("lightningMode", forceNavigatorSettings.lightningMode)
			break
		case "commands.toggleEnhancedProfiles":
			forceNavigatorSettings.enhancedprofiles = !forceNavigatorSettings.enhancedprofiles
			forceNavigatorSettings.set("enhancedprofiles", forceNavigatorSettings.enhancedprofiles)
			return true
			break
		case "dump":
		case "commands.dumpDebug":
			console.info("session settings:", forceNavigatorSettings)
			console.info("server instance: ", forceNavigator.serverInstance)
			console.info("API Url: ", forceNavigator.apiUrl)
			console.info("Commands: ", forceNavigator.commands)
			hideSearchBox()
			break
		case "commands.toggleDeveloperName":
		    forceNavigatorSettings.developername = !forceNavigatorSettings.developername
			forceNavigatorSettings.set("developername", forceNavigatorSettings.developername)
			return true
			break
		case "commands.setup":
			targetUrl = forceNavigator.serverInstance + (forceNavigatorSettings.lightningMode ? "/lightning/setup/SetupOneHome/home" : "/ui/setup/Setup")
			break
		case "commands.home":
			targetUrl = forceNavigator.serverInstance + "/"
			break
		case "commands.toggleAllCheckboxes":
			Array.from(document.querySelectorAll('input[type="checkbox"]')).forEach(c => c.checked=(c.checked ? false : true))
			hideSearchBox()
			break
		case "commands.loginAs": 
			loginAs(command, newTab)
			return true
		case "commands.setTheme":
			forceNavigatorSettings.setTheme(command.value)
			return true // probably not needed
		case "commands.mergeAccounts":
			launchMergerAccounts(command.value)
			break
		case "commands.createTask":
			createTask(cmd.substring(1).trim())
			break
		case "commands.search":
			targetUrl = searchTerms(cmd.substring(1).trim())
	}
	if(checkCmd.replace(/\d+/,'').trim().split(' ').reduce((i,c) => {
		if('set search limit'.includes(c))
			return ++i
		else
			return i
	}, 0) > 1) {
		const newLimit = parseInt(checkCmd.replace(/\D+/,''))
		if(newLimit != NaN && newLimit <= MAX_SEARCH_RESULTS) {
			forceNavigatorSettings.searchLimit = newLimit
			forceNavigatorSettings.set("searchLimit", forceNavigatorSettings.searchLimit)
				.then(result=>addWord(t("notification.searchSettingsUpdated")))
			return true
		} else
			addError(t("error.searchLimitMax"))
	}
	else if(typeof commands[cmd] != 'undefined' && commands[cmd].url) { targetUrl = commands[cmd].url }
	else if(forceNavigatorSettings.debug) {
		console.log(t(command.key) + t("error.notFound"))
		return false
	}
	if(targetUrl != "") {
		hideSearchBox()
		goToUrl(targetUrl, newTab, {command: command})
		return true
	} else {
		console.debug('No command match', command)
		return false
	}
}
 const loginAs = (cmd, newTab)=>{
	let cmdSplit = cmd.split(' ')
	let searchValue = cmdSplit[2]
	if(cmdSplit[3] !== undefined)
		searchValue += '+' + cmdSplit[3]
	showLoadingIndicator()
	chrome.runtime.sendMessage({
		action:'searchLogins', apiUrl: apiUrl,
		key: sessionHash, sessionId: sessionId,
		domain: serverInstance, sessionHash: sessionHash,
		searchValue: searchValue, userId: userId
	}, success=>{
		let numberOfUserRecords = success.records.length
		hideLoadingIndicator()
		if(numberOfUserRecords < 1) { addError([{"message":"No user for your search exists."}]) }
		else if(numberOfUserRecords > 1) { loginAsShowOptions(success.records) }
		else {
			var userId = success.records[0].Id
			loginAsPerform(userId, newTab)
		}
	})
}
const loginAsShowOptions = (records)=>{
	for(let i = 0; i < records.length; ++i) {
		let cmd = t("prefix.loginAs") + records[i].Name
		commands[cmd] = { "key": cmd, "id": records[i].Id}
		addWord(cmd)
	}
	let firstEl = document.querySelector('#sfnavOutput :first-child')
	if(listPosition == -1 && firstEl != null) firstEl.className = "sfnav_child sfnav_selected"
}
const loginAsPerform = (userId, newTab)=>{
	let targetUrl = "https://" + forceNavigator.apiUrl + "/servlet/servlet.su?oid=" + forceNavigator.organizationId + "&suorgadminid=" + userId + "&retURL=" + encodeURIComponent(window.location.pathname) + "&targetURL=" + encodeURIComponent(window.location.pathname) + "&"
	hideSearchBox()
	if(newTab) goToUrl(targetUrl, true)
	else goToUrl(targetUrl)
	return true
}

forceNavigator.init()