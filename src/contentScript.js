import { forceNavigator, forceNavigatorSettings } from "./shared"
import { t } from "lisan"

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
		forceNavigator.clearOutput()
		forceNavigator.addSearchResult("commands.errorAccountMerge")
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
	ui.showLoadingIndicator()
	if(["",null,undefined].includes(subject) && !forceNavigator.userId) { console.error("Empty Task subject"); hideLoadingIndicator(); return }
	chrome.runtime.sendMessage({
			"action":'createTask', "apiUrl": forceNavigator.apiUrl,
			"key": forceNavigator.sessionHash, "sessionId": forceNavigator.sessionId,
			"domain": forceNavigator.serverInstance, "sessionHash": forceNavigator.sessionHash,
			"subject": subject, "userId": forceNavigator.userId
		}, response=>{
			if(response.errors.length != 0) { console.error("Error creating task", response.errors); return }
			clearOutput()
			forceNavigator.commands["commands.goToTask"] = {
				"key": "commands.goToTask",
				"url": forceNavigator.serverInstance + "/"+ response.id
			}
			forceNavigator.quickSearch.value = ""
			ui.addSearchResult("commands.goToTask")
			ui.addSearchResult("commands.escapeCommand")
			let firstEl = document.querySelector('#sfnavOutputs :first-child')
			if(listPosition == -1 && firstEl != null)
				firstEl.className = "sfnav_child sfnav_selected"
			hideLoadingIndicator()
	})
}

forceNavigator.init()