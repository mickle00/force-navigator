// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
   
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

// A Library for url pattern matches.
// Match patterns: http://dev.chromium.org/developers/design-documents/extensions/match-patterns
//
// The MIT License
// Copyright (c) 2009 swdyh

function URLPattern(patterns) {
    var hostTree = { keys: {}, values: [] }
    var filePatterns = []
    for (var i = 0; i < patterns.length; i++) {
        var ps = [].concat(patterns[i])
        for (var j = 0; j < ps.length; j++) {
            try {
                var pt = URLPattern.parse(ps[j])
                if (pt.scheme == 'file') {
                    filePatterns.push([i, j])
                }
                else {
                    URLPattern.addTree(hostTree, pt.host, [i, j])
                }
            }
            catch(e) {
                // console.log(e)
            }
        }
    }
    this.patterns = patterns
    this.hostTree = hostTree
    this.filePatterns = filePatterns
}
URLPattern.addTree = function(tree, host, val) {
    var currentNode = tree
    var tmp = host.split('.').reverse()
    for (var i = 0; i < tmp.length; i++) {
        if (!currentNode.keys[tmp[i]]) {
            currentNode.keys[tmp[i]] = { keys: {}, values: [] }
        }
        if (i != (tmp.length - 1)) {
            currentNode = currentNode.keys[tmp[i]]
        }
        else {
            currentNode.keys[tmp[i]].values.push(val)
        }
    }
    return tree
}
URLPattern.prototype.matches = function(url) {
    try {
        var result = []
        var u = URLPattern.parse(url)
        var hosts = (u.scheme == 'file') ? this.filePatterns :
            URLPattern.searchTree(this.hostTree, u.host)
        for (var i = 0; i < hosts.length; i++) {
            var index = hosts[i][0]
            var patternIndex = hosts[i][1]
            var pt = URLPattern.parse([].concat(this.patterns[index])[patternIndex])
            if ((pt.scheme == u.scheme) &&
                (!pt.path || URLPattern.matchesPath(pt.path, u.path))) {
                result.push(index)
            }
        }
        return result
    }
    catch(e) {
        // console.log(e)
        return []
    }
}
URLPattern.matchesPath = function(pattern, path) {
    var escaped = pattern.replace(/[.+?|()\\[\\]{}\\\\]/g, '\\$1')
    var re = new RegExp(escaped.replace('*', '.*'))
    return re.test(path || '/')
}
URLPattern.searchTree = function(tree, host) {
    var tmp = host.split('.').reverse()
    var currentNode = tree
    var result = []
    for (var i = 0; i < tmp.length; i++) {
        if (currentNode.keys['*']) {
            Array.prototype.push.apply(result, currentNode.keys['*'].values)
        }
        if (currentNode.keys[tmp[i]]) {
            Array.prototype.push.apply(result,
                                       currentNode.keys[tmp[i]].values)
            currentNode = currentNode.keys[tmp[i]]
        }
        else {
            break
        }
    }
    return result
}
URLPattern.parse = function(url) {
    var re = /^(http|https|file|ftp):\/\/([^\/]+)?(\/[^ ]+)?/
    var matched = url.match(re)
    if (matched) {
        return { scheme: matched[1], host: matched[2], path: matched[3] }
    }
    else {
        throw 'not supported url'
    }
}
URLPattern.matches = function(pattern, url) {
    var up = new URLPattern([pattern])
    return up.matches(url).length > 0
}



// get key path 
// http://stackoverflow.com/questions/8817394/javascript-get-deep-value-from-object-by-passing-path-to-it-as-string

// Object.prototype.getByPath = function(path){
//     var obj = this;
    
//     for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
//         obj = obj[path[i]];
//     };
//     return obj;
// };