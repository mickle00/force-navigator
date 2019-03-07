document.addEventListener('DOMContentLoaded', function() {
	// document.getElementById('save').addEventListener('click', save)
	main()
})

function main() {
	chrome.browserAction.setBadgeText({ text: "" })
	// chrome.extension.sendMessage({ 'action': 'Get Settings' }, function(response) {
	// 	document.getElementById('shortcut').value = response['shortcut'];
	// })
}

// function save() {
// 	let payload_shortcut = document.getElementById('shortcut').value;
// 	let payload = { 'shortcut': payload_shortcut }
// 	chrome.extension.sendMessage({ 'action': 'Set Settings', 'payload': payload }, function(response) {
// 		chrome.tabs.getSelected(null, function(tab) {
// 			var code = 'window.location.reload();'
// 			chrome.tabs.executeScript(tab.id, { code: code })
// 		})
// 		window.close()
// 	})
// }