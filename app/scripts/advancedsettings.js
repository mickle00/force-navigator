window.onload = function() {

    var container = document.getElementById("jsoneditor");
    
    var options = {
        mode: 'tree',
        modes: ['text', 'tree', 'view'], // allowed modes
        error: function (err) {
          alert(err.toString());
        },
        change: function() {
          chrome.storage.local.set(editor.get(), function() {
            
          });
        }
      };
    var editor = new jsoneditor.JSONEditor(container, options);  
    // set json
    chrome.storage.local.get(null, function(results) {
      var json = JSON.stringify(results);
      editor.set(results);
    });
    

    // get json
    var json = editor.get();
}
 chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});