import { forceNavigatorSettings } from "./shared"
import { t } from "lisan"
import Mousetrap from "mousetrap"

const inputHandler = (function(m) {
	var _global_callbacks = {},
		_original_stop_callback = m.stopCallback
	m.stopCallback = function(e, element, combo) {
		if (_global_callbacks[combo]) { return false }
		return _original_stop_callback(e, element, combo)
	}
	m.bindGlobal = function(keys, callback, action) {
		m.bind(keys, callback, action)
		if (keys instanceof Array) {
			for (var i = 0; i < keys.length; i++) { _global_callbacks[keys[i]] = true }
			return
		}
		_global_callbacks[keys] = true
	}
	return m
})(Mousetrap)

export const ui = {
	"createBox": ()=>{
		let theme = forceNavigatorSettings.theme
		let div = document.createElement("div")
		div.setAttribute("id", "sfnavStyleBox")
		div.setAttribute("class", theme)
		const loaderURL = chrome.extension.getURL("images/ajax-loader.gif")
		const logoURL = chrome.extension.getURL("images/sf-navigator128.png")
		div.innerHTML = `
<div id="sfnavSearchBox">
	<div class="sfnav_wrapper">
		<input type="text" id="sfnavQuickSearch" autocomplete="off"/>
		<img id="sfnavLoader" src= "${loaderURL}"/>
		<img id="sfnav_logo" src= "${logoURL}"/>
	</div>
	<div class="sfnav_shadow" id="sfnav_shadow"/>
	<div class="sfnavOutput" id="sfnavOutput"/>
</div>`
		document.body.appendChild(div)
		searchBox = document.getElementById("sfnavOutput")
	},
	"mouseHandler": ()=>{
		this.classList.add('sfnav_selected')
		mouseClickLoginAsUserId = this.getAttribute("id")
		return true
	},
	"mouseClick": ()=>{
		document.getElementById("sfnavQuickSearch").value = this.firstChild.nodeValue
		listPosition = -1
		setVisibleSearch("hidden")
		if(!window.ctrlKey)
			invokeCommand(this.firstChild.nodeValue, false,'click')
		else
			hideSearchBox()
		return true
	},
	"mouseHandlerOut": ()=>{ this.classList.remove('sfnav_selected'); return true },
	"mouseClickLoginAs": ()=>{ loginAsPerform(mouseClickLoginAsUserId); return true },
	"bindShortcuts": ()=>{
		let searchBar = document.getElementById('sfnavQuickSearch')
		inputHandler.bindGlobal('esc', function(e) { hideSearchBox() })
		inputHandler.wrap(searchBar).bind('enter', kbdCommand)
		for (var i = 0; i < newTabKeys.length; i++) {
			inputHandler.wrap(searchBar).bind(newTabKeys[i], kbdCommand)
		}
		inputHandler.wrap(searchBar).bind('down', selectMove.bind(this, 'down'))
		inputHandler.wrap(searchBar).bind('up', selectMove.bind(this, 'up'))
		inputHandler.wrap(document.getElementById('sfnavQuickSearch')).bind('backspace', function(e) { listPosition = -1 })
		document.getElementById('sfnavQuickSearch').oninput = function(e) {
			ui.lookAt()
			return true
		}
	},
	"showLoadingIndicator": ()=>{ document.getElementById('sfnavLoader').style.visibility = 'visible' },
	"hideLoadingIndicator": ()=>{ document.getElementById('sfnavLoader').style.visibility = 'hidden' },
	"hideSearchBox": ()=>{
		let searchBar = document.getElementById('sfnavQuickSearch')
		searchBar.blur()
		ui.clearOutput()
		searchBar.value = ''
		ui.setVisibleSearch("hidden")
	},
	"setVisibleSearch": (visibility)=>{
		let searchBox = document.getElementById("sfnavSearchBox")
		if(visibility == "hidden") {
			searchBox.style.opacity = 0
			searchBox.style.zIndex = -1
		}
		else {
			searchBox.style.opacity = 0.98
			searchBox.style.zIndex = 9999
			document.getElementById("sfnavQuickSearch").focus()
		}
	},
	"lookAt": ()=>{
		let newSearchVal = document.getElementById('sfnavQuickSearch').value
		if(newSearchVal !== '') ui.addElements(newSearchVal)
		else {
			document.querySelector('#sfnavOutput').innerHTML = ''
			listPosition = -1
		}
	},
	"addElements": (input)=>{
		ui.clearOutput()
		if(input.substring(0,1) == "?") ui.addWord('Global Search Usage: ? <Search term(s)>')
		else if(input.substring(0,1) == "!") ui.addWord('Create a Task: ! <Subject line>')
		else {
			let words = ui.getWord(input, commands)
			if(words.length > 0)
			for (var i=0;i < words.length; ++i)
			ui.addWord(words[i])
			else
			listPosition = -1
		}
		let firstEl = document.querySelector('#sfnavOutput :first-child')
		if(listPosition == -1 && firstEl != null) firstEl.className = "sfnav_child sfnav_selected"
	},
	"getWord": (input, dict)=>{
		// only works here for some reason, pruning the command dictionary on load would carry over for some reason?!
		if(sessionSettings.enhancedprofiles) {
			dict['Setup > Manage Users > Profiles'] = dict['Enhanced Profiles'] // todo language fixes
			delete dict['Profiles']
		} else {
			dict['Setup > Manage Users > Profiles'] = dict['Profiles']
			delete dict['Enhanced Profiles']
		}
		if(typeof input === 'undefined' || input == '') return []
		let foundCommands = [],
			dictItems = [],
			terms = input.toLowerCase().split(" ")
		for (var key in dict) {
			if(key.toLowerCase().indexOf(input) != -1) {
				dictItems.push({num: sessionSettings.searchLimit, key: key})
			} else {
				let match = 0
				for(let i=0;i<terms.length;i++) {
					if(key.toLowerCase().indexOf(terms[i]) != -1) {
						match++
						sortValue = 1
					}
				}
				for(let i=1;i<=terms.length;i++) {
					if(key.toLowerCase().indexOf(terms.slice(0,i).join(' ')) != -1)
						sortValue++
					else
						break
				}
				if (match == terms.length)
					dictItems.push({num : sortValue, key : key})
			}
		}
		dictItems.sort(function(a,b) { return b.num - a.num })
		for(let i = 0;i < sessionSettings.searchLimit && dictItems[i];i++)
			foundCommands.push(dictItems[i].key)
		return foundCommands
	},
	"addWord": (word)=>{
		var d = document.createElement("div")
		var sp
		if(commands[word] != null && commands[word].url != null && commands[word].url != "") {
			sp = document.createElement("a")
			if(commands[word].url.startsWith('//'))
				commands[word].url = commands[word].url.replace('//','/')
			sp.setAttribute("href", commands[word].url)
		} else { sp = d }
		if(commands[word] != null && commands[word].id != null && commands[word].id != "") { sp.id = commands[word].id }
		sp.classList.add('sfnav_child')
		sp.appendChild(document.createTextNode(word))
		sp.onmouseover = mouseHandler
		sp.onmouseout = mouseHandlerOut
		sp.onclick = mouseClick
		if(sp.id && sp.length > 0) { sp.onclick = mouseClickLoginAs }
		searchBox.appendChild(sp)
	},
	"addError": (text)=>{
		ui.clearOutput()
		let err = document.createElement("div")
		err.className = "sfnav_child sfnav-error-wrapper"
		err.appendChild(document.createTextNode(t("prefix.error")))
		err.appendChild(document.createElement('br'))
		for(var i = 0;i<text.length;i++) {
			err.appendChild(document.createTextNode(text[i].message))
			err.appendChild(document.createElement('br'))
		}
		searchBox.appendChild(err)
	},
	"clearOutput": ()=>{ if(typeof searchBox != 'undefined') searchBox.innerHTML = "" },
	"kbdCommand": (e, key)=>{
		let position = listPosition
		let origText = '', newText = ''
		if(position < 0) position = 0
			origText = document.getElementById("sfnavQuickSearch").value
		if(typeof searchBox.childNodes[position] != 'undefined')
			newText = searchBox.childNodes[position].firstChild.nodeValue
		let newTab = newTabKeys.indexOf(key) >= 0 ? true : false
		if(!newTab)
			ui.clearOutput()
		if(!invokeCommand(newText, newTab))
			invokeCommand(origText, newTab)
	},
	"selectMove": (direction)=>{
		let searchBar = document.getElementById('sfnavQuickSearch')
		let firstChild
		let words = []
		for (var i = 0; i < searchBox.childNodes.length; i++)
			words.push(searchBox.childNodes[i].textContent)
		if(searchBox.childNodes[listPosition] != null)
			firstChild = searchBox.childNodes[listPosition].firstChild.nodeValue
		else
			firstChild = null
		let isLastPos = direction == 'down' ? listPosition < words.length-1 : listPosition >= 0
		if (words.length > 0 && isLastPos) {
			if(listPosition < 0) listPosition = 0
				listPosition = listPosition + (direction == 'down' ? 1 : -1)
			if(searchBox.childNodes[listPosition] != null)
				firstChild = searchBox.childNodes[listPosition].firstChild.nodeValue
			else
				firstChild = null
			if (listPosition >=0) {
				searchBox.childNodes[listPosition + (direction == 'down' ? -1 : 1) ].classList.remove('sfnav_selected')
				searchBox.childNodes[listPosition].classList.add('sfnav_selected')
				searchBox.childNodes[listPosition].scrollIntoViewIfNeeded()
				return false
			}
		}
	}
}
