// @copyright 2012+ Daniel Nakov / Silverline CRM
// http://silverlinecrm.com

var sfnav = (function() {
    var outp;
    var oldins;
    var posi = -1;

    var input;
    var key;
    var metaData = {};
    var serverInstance = getServerInstance();
    var cmds = {};
    var isCtrl = false;
    var clientId;
    var loaded=false;
    var shortcut;
    var sid;
    var SFAPI_VERSION = 'v28.0';
    var ftClient;
    var customObjects = {};
    var META_DATATYPES = {
        "AUTONUMBER": {name:"AutoNumber",code:"auto", params:0},
        "CHECKBOX": {name:"Checkbox",code:"cb", params:0},
        "CURRENCY": {name:"Currency",code:"curr", params:2},
        "DATE": {name:"Date",code:"d", params:0},
        "DATETIME": {name:"DateTime",code:"dt", params:0},
        "EMAIL": {name:"Email",code:"e", params:0},
        "FORMULA": {name:"FORMULA",code:"form"},
        "GEOLOCATION": {name:"Location",code:"geo"},
        "HIERARCHICALRELATIONSHIP": {name:"Hierarchy",code:"hr" },
        "LOOKUP": {name:"Lookup",code:"look"},
        "MASTERDETAIL": {name:"MasterDetail",code:"md"},
        "NUMBER": {name:"Number",code:"n"},
        "PERCENT": {name:"Percent",code:"per"},
        "PHONE": {name:"Phone",code:"ph"},
        "PICKLIST": {name:"Picklist",code:"pl"},
        "PICKLISTMS": {name:"MultiselectPicklist",code:"plms"},
        "ROLLUPSUMMARY": {name:"Summary",code:"rup"},
        "TEXT": {name:"Text",code:"t"},
        "TEXTENCRYPTED": {name:"EcryptedText",code:"te"},
        "TEXTAREA": {name:"TextArea",code:"ta"},
        "TEXTAREALONG": {name:"LongTextArea",code:"tal"},
        "TEXTAREARICH": {name:"Html",code:"tar"},
        "URL": {name:"Url",code:"url"}
    };

/**
 * adds a bindGlobal method to Mousetrap that allows you to
 * bind specific keyboard shortcuts that will still work
 * inside a text input field
 *
 * usage:
 * Mousetrap.bindGlobal('ctrl+s', _saveChanges);
 */
     Mousetrap = (function(Mousetrap) {
        var _global_callbacks = {},
        _original_stop_callback = Mousetrap.stopCallback;

        Mousetrap.stopCallback = function(e, element, combo) {
            if (_global_callbacks[combo]) {
                return false;
            }

            return _original_stop_callback(e, element, combo);
        };

        Mousetrap.bindGlobal = function(keys, callback, action) {
            Mousetrap.bind(keys, callback, action);

            if (keys instanceof Array) {
                for (var i = 0; i < keys.length; i++) {
                    _global_callbacks[keys[i]] = true;
                }
                return;
            }

            _global_callbacks[keys] = true;
        };

        return Mousetrap;
    }) (Mousetrap);

     var mouseHandler=
     function(){
        this.classList.add('sfnav_selected');

        return true;
    }

    var mouseHandlerOut=
    function(){
        this.classList.remove('sfnav_selected');
        return true;
    }

    var mouseClick=
    function(){
        document.getElementById("sfnav_quickSearch").value = this.firstChild.nodeValue;
        setVisible("hidden");
        posi = -1;
        oldins = this.firstChild.nodeValue;
        setVisibleSearch("hidden");
        setVisible("hidden");
        invokeCommand(this.firstChild.nodeValue);
        return true;
    }

    function getSingleObjectMetadata()
    {
        var recordId = document.URL.split('/')[3];
        var keyPrefix = recordId.substring(0,3);

    }
    function addElements(ins)
    {

        if(ins.substring(0,3) == 'cf ' && ins.split(' ').length < 4)
        {

            clearOutput();
            addWord('Usage: cf <Object API Name> <Field Name> <Data Type>');
            setVisible('visible');

        }
        else if(ins.substring(0,3) == 'cf ' && ins.split(' ').length == 4)
        {
            clearOutput();
            var wordArray = ins.split(' ');

            words = getWord(wordArray[3], META_DATATYPES);
            var words2 = [];
            for(var i = 0; i<words.length; i++)
            {
                switch(words[i].toUpperCase())
                {
                    case 'AUTONUMBER':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'CHECKBOX':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'CURRENCY':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <scale> <precision>') ;
                    break;
                    case 'DATE':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'DATETIME':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'EMAIL':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'FORMULA':

                    break;
                    case 'GEOLOCATION':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <scale>');
                    break;
                    case 'HIERARCHICALRELATIONSHIP':

                    break;
                    case 'LOOKUP':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <lookup sObjectName>');
                    break;
                    case 'MASTERDETAIL':

                    break;
                    case 'NUMBER':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <scale> <precision>');
                    break;
                    case 'PERCENT':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <scale> <precision>');
                    break;
                    case 'PHONE':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'PICKLIST':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'PICKLISTMS':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;
                    case 'ROLLUPSUMMARY':

                    break;
                    case 'TEXT':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <length>');
                    break;
                    case 'TEXTENCRYPTED':

                    break;
                    case 'TEXTAREA':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <length>');
                    break;
                    case 'TEXTAREALONG':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <length> <visible lines>');
                    break;
                    case 'TEXTAREARICH':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i] + ' <length> <visible lines>');
                    break;
                    case 'URL':
                    words2.push(wordArray[0] + ' ' + wordArray[1] + ' ' + wordArray[2] + ' ' + words[i]);
                    break;

                }


            }
            if (words2.length > 0){
                clearOutput();
                for (var i=0;i<words2.length; ++i) addWord (words2[i]);
                    setVisible("visible");
                input = document.getElementById("sfnav_quickSearch").value;
            }
            else{
                setVisible("hidden");
                posi = -1;
            }
            /*
            for(var i=0;i<Object.keys(META_DATATYPES).length;i++)
            {
                addWord(Object.keys(META_DATATYPES)[i]);
            }
            */
            setVisible('visible');
        }
        else if(ins.substring(0,3) == 'cf ' && ins.split(' ').length > 4)
        {
            clearOutput();
        }
        else
        {
            words = getWord(ins, cmds);

            if (words.length > 0){
                clearOutput();
                for (var i=0;i<words.length; ++i) addWord (words[i]);
                    setVisible("visible");
                input = document.getElementById("sfnav_quickSearch").value;
            }
            else{
                setVisible("hidden");
                posi = -1;
            }
        }
    }

    function httpGet(url, callback)
    {
     var req = new XMLHttpRequest();
     req.open("GET", url, true);
     req.setRequestHeader("Authorization", sid);
     req.onload = function(response) {
         callback(response);
     }
     req.send();
    }
    function setVisible(visi){
        var x = document.getElementById("sfnav_shadow");
        var t = document.getElementById("sfnav_quickSearch");

        x.style.position = 'relative';

        x.style.visibility = visi;
    }
    function setVisibleSearch(visi)
    {


        var t = document.getElementById("sfnav_search_box");
        t.style.visibility = visi;
        if(visi=='visible') document.getElementById("sfnav_quickSearch").focus();
    }

    function lookAt(){
        var ins = document.getElementById("sfnav_quickSearch").value;

        if (oldins == ins && ins.length > 0) return;
        else if (posi > -1);
        else if (ins.length > 0){
            addElements(ins);
        }
        else{
            setVisible("hidden");
            posi = -1;
        }
        oldins = ins;
    }
    function addWord(word){
        var sp = document.createElement("div");
        sp.className=  "sfnav_child";
        sp.appendChild(document.createTextNode(word));
        sp.onmouseover = mouseHandler;
        sp.onmouseout = mouseHandlerOut;
        sp.onclick = mouseClick;
        outp.appendChild(sp);
    }

    function addSuccess(text)
    {
        clearOutput();
        var err = document.createElement("div");
        err.className = 'sfnav_child sfnav-success-wrapper';
        var errorText = '';
        err.appendChild(document.createTextNode('Success! '));
        err.appendChild(document.createElement('br'));
        err.appendChild(document.createTextNode('Field ' + text.id + ' created!'));
        outp.appendChild(err);

        setVisible("visible");
    }

    function addError(text)
    {
        clearOutput();
        var err = document.createElement("div");
        err.className = 'sfnav_child sfnav-error-wrapper';

        var errorText = '';
        err.appendChild(document.createTextNode('Error! '));
        err.appendChild(document.createElement('br'));
        for(var i = 0;i<text.length;i++)
        {
            err.appendChild(document.createTextNode(text[i].message));
            err.appendChild(document.createElement('br'));
        }

        /*
        var ta = document.createElement('textarea');
        ta.className = 'sfnav-error-textarea';
        ta.value = JSON.stringify(text, null, 4);

        err.appendChild(ta);
        */
        outp.appendChild(err);

        setVisible("visible");
    }

    function clearOutput(){
        if(typeof outp != 'undefined')
        {
            while (outp.hasChildNodes()){
                noten=outp.firstChild;
                outp.removeChild(noten);
            }
        }
        posi = -1;
    }
    function getWord(beginning, dict){
        var words = [];
        if(typeof beginning === 'undefined') return [];

        var tmpSplit = beginning.split(' ');
        var match = false;
        if(beginning.length == 0)
        {
            for (var key in dict)
               words.push(key);
           return words;
       }
       var arrFound = [];
       for (var key in dict)
       {
        match = false;
        if(key.toLowerCase().indexOf(beginning) != -1)
        {
            arrFound.push({num : 10,key : key});
        }
        else
        {
            for(var i = 0;i<tmpSplit.length;i++)
            {

                if(key.toLowerCase().indexOf(tmpSplit[i].toLowerCase()) != -1)
                {
                    match = true;
                }
                else
                {
                    match = false;
                    break;
                }
            }
            if(match) arrFound.push({num : 1, key : key});
        }
    }
    arrFound.sort(function(a,b) {
        return b.num - a.num;
    });
    for(var i = 0;i<arrFound.length;i++)
        words[words.length] = arrFound[i].key;

    return words;
    }
    function setColor (_posi, _color, _forg){
        outp.childNodes[_posi].style.background = _color;
        outp.childNodes[_posi].style.color = _forg;
    }

    function invokeCommand(cmd) {
        if(typeof cmds[cmd] != 'undefined' && (cmds[cmd].url != null || cmds[cmd].url == ''))
        {
            window.location.href = cmds[cmd].url;
            return true;
        }
        if(cmd.toLowerCase() == 'refresh metadata')
        {
            getAllObjectMetadata();
            return true;
        }
        if(cmd.toLowerCase() == 'setup')
        {
            window.location.href = serverInstance + '.salesforce.com/setup/forcecomHomepage.apexp?setupid=ForceCom';
            return true;
        }
        if(cmd.toLowerCase().substring(0,3) == 'cf ')
        {
            createField(cmd);
            return true;
        }

        return false;
    }

    function updateField(cmd)
    {
        var arrSplit = cmd.split(' ');
        var dataType = '';
        var fieldMetadata;

        if(arrSplit.length >= 3)
        {
            for(var key in META_DATATYPES)
            {
                if(META_DATATYPES[key].name.toLowerCase() === arrSplit[3].toLowerCase())
                {
                    dataType = META_DATATYPES[key].name;
                    break;
                }
            }

            var sObjectName = arrSplit[1];
            var fieldName = arrSplit[2];
            var helpText = null;
            var typeLength = arrSplit[4];
            var rightDecimals, leftDecimals;
            if(parseInt(arrSplit[5]) != NaN )
            {
                rightDecimals = parseInt(arrSplit[5]);
                leftDecimals = typeLength;
            }
            else
            {
                leftDecimals = 0;
                rightDecimals = 0;
            }




            ftClient.queryByName('CustomField', fieldName, sObjectName, function(success) {
                addSuccess(success);
                fieldMeta = new  forceTooling.CustomFields.CustomField(arrSplit[1], arrSplit[2], dataType, null, arrSplit[4], parseInt(leftDecimals),parseInt(rightDecimals),null);

                ftClient.update('CustomField', fieldMeta,
                    function(success) {
                        console.log(success);
                        addSuccess(success);
                    },
                    function(error) {
                        console.log(error);
                        addError(error.responseJSON);
                    });
            },
            function(error)
            {
                addError(error.responseJSON);
            });


        }
    }

    function createField(cmd)
    {
        var arrSplit = cmd.split(' ');
        var dataType = '';
        var fieldMetadata;

        if(arrSplit.length >= 3)
        {
            //  forceTooling.Client.create(whatever)
            /*
            for(var key in META_DATATYPES)
            {
                if(META_DATATYPES[key].name.toLowerCase() === arrSplit[3].toLowerCase())
                {
                    dataType = META_DATATYPES[key].name;
                    break;
                }
            }
            */
            dataType = META_DATATYPES[arrSplit[3].toUpperCase()].name;
            var sObjectName = arrSplit[1];
            var sObjectId = null;
            if(typeof customObjects[sObjectName.toLowerCase()] !== 'undefined')
            {
                sObjectId = customObjects[sObjectName.toLowerCase()].Id;
                sObjectName += '__c';
            }
            var fieldName = arrSplit[2];
            var helpText = null;
            var typeLength = arrSplit[4];
            var rightDecimals, leftDecimals;
            if(parseInt(arrSplit[5]) != NaN )
            {
                rightDecimals = parseInt(arrSplit[5]);
                leftDecimals = parseInt(typeLength);
            }
            else
            {
                leftDecimals = 0;
                rightDecimals = 0;
            }

            var fieldMeta;

            switch(arrSplit[3].toUpperCase())
            {
                case 'AUTONUMBER':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,0);
                break;
                case 'CHECKBOX':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,0);
                break;
                case 'CURRENCY':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,0);
                break;
                case 'DATE':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,0);
                break;
                case 'DATETIME':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,0);
                break;
                case 'EMAIL':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,0);
                break;
                case 'FORMULA':

                break;
                case 'GEOLOCATION':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null, arrSplit[4],null,null,0);
                break;
                case 'HIERARCHICALRELATIONSHIP':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],0);
                break;
                case 'LOOKUP':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],0);
                break;
                case 'MASTERDETAIL':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],0);
                break;
                case 'NUMBER':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,0);
                break;
                case 'PERCENT':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,0);
                break;
                case 'PHONE':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,0);
                break;
                case 'PICKLIST':
                var plVal = [];
                plVal.push(new forceTooling.CustomFields.PicklistValue('CHANGEME'));
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,plVal,null,0);
                break;
                case 'PICKLISTMS':
                var plVal = [];
                plVal.push(new forceTooling.CustomFields.PicklistValue('CHANGEME'));
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,plVal,null,0);
                break;
                case 'ROLLUPSUMMARY':

                break;
                case 'TEXT':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,0);
                break;
                case 'TEXTENCRYPTED':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,0);
                break;
                case 'TEXTAREA':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,0);
                break;
                case 'TEXTAREALONG':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,arrSplit[4]);
                break;
                case 'TEXTAREARICH':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,arrSplit[4]);
                break;
                case 'URL':
                fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,0);
                break;

            }

            ftClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, serverInstance + '.salesforce.com');
            showLoadingIndicator();
            ftClient.create('CustomField', fieldMeta,
                function(success) {
                    console.log(success);
                   hideLoadingIndicator();
                    addSuccess(success);
                },
                function(error) {
                    console.log(error);
                  hideLoadingIndicator();
                    addError(error.responseJSON);
                });
        }

    }

    function getMetadata(_data) {
        if(_data.length == 0) return;
        var metadata = JSON.parse(_data);

        var mRecord = {};
        var act = {};
        metaData = {};


        for(var i=0;i<metadata.sobjects.length;i++)
        {
            if(metadata.sobjects[i].keyPrefix != null)
            {
                mRecord = {};
                mRecord.label = metadata.sobjects[i].label;
                mRecord.labelPlural = metadata.sobjects[i].labelPlural;
                mRecord.keyPrefix = metadata.sobjects[i].keyPrefix;
                mRecord.urls = metadata.sobjects[i].urls;
                metaData[metadata.sobjects[i].keyPrefix] = mRecord;

                act = {};
                act.key = metadata.sobjects[i].name;
                act.keyPrefix = metadata.sobjects[i].keyPrefix;
                act.url = serverInstance + '.salesforce.com/' + metadata.sobjects[i].keyPrefix;

                cmds['List ' + mRecord.labelPlural] = act;
                act = {};
                act.key = metadata.sobjects[i].name;
                act.keyPrefix = metadata.sobjects[i].keyPrefix;
                act.url = serverInstance + '.salesforce.com/' + metadata.sobjects[i].keyPrefix;
                act.url += '/e';
                cmds['New ' + mRecord.label] = act;


            }
        }

        store('Store Commands', cmds);
        store('Store Metadata', metaData)
    }

    function store(action, payload) {

        var req = {}
        req.action = action;
        req.key = clientId;
        req.payload = payload;

        chrome.extension.sendMessage(req, function(response) {

        });

        // var storagePayload = {};
        // storagePayload[action] = payload;
        // chrome.storage.local.set(storagePayload, function() {
        //     console.log('stored');
        // });
    }

    function getAllObjectMetadata() {

        sid = "Bearer " + getCookie('sid');
        var theurl = getServerInstance() + '.salesforce.com/services/data/' + SFAPI_VERSION + '/sobjects/';

        cmds['Refresh Metadata'] = {};
        cmds['Setup'] = {};
        var req = new XMLHttpRequest();
        req.open("GET", theurl, true);
        req.setRequestHeader("Authorization", sid);
        req.onload = function(response) {
         getMetadata(response.target.responseText);
     }
     req.send();
     getSetupTree();
     // getCustomObjects();
     getCustomObjectsDef();
    }

    function parseSetupTree(html)
    {
        var allLinks = html.getElementById('setupNavTree').getElementsByClassName("parent");
        var strName;
        var as;
        var strNameMain;
        var strName;
        for(var i = 0; i<allLinks.length;i++)
        {

            var as = allLinks[i].getElementsByTagName("a");
            for(var j = 0;j<as.length;j++)
            {
                if(as[j].id.indexOf("_font") != -1)
                {
                    strNameMain = 'Setup > ' + as[j].text + ' > ';
                    break;
                }

            }
            var children = allLinks[i].querySelectorAll('.childContainer > .setupLeaf > a');
            for(var j = 0;j<children.length;j++)
            {
                if(children[j].text.length > 2)
                {
                    strName = strNameMain + children[j].text;
                    if(cmds[strName] == null) cmds[strName] = {url: children[j].href, key: strName};
                }
            }

        }
        store('Store Commands', cmds);
    }

    function getSetupTree() {

        var theurl = serverInstance + '.salesforce.com/setup/forcecomHomepage.apexp?setupid=ForceCom'
        var req = new XMLHttpRequest();
        req.onload = function() {
         parseSetupTree(this.response);
     }
     req.open("GET", theurl);
     req.responseType = 'document';

     req.send();
    }

    function getCustomObjects()
    {
        var theurl = serverInstance + '.salesforce.com/p/setup/custent/CustomObjectsPage';
        var req = new XMLHttpRequest();
        req.onload = function() {
            parseCustomObjectTree(this.response);
        }
     req.open("GET", theurl);
     req.responseType = 'document';

     req.send();
    }

    function parseCustomObjectTree(html)
    {

        $(html).find('th a').each(function(el) {
            cmds['Setup > Custom Object > ' + this.text] = {url: this.href, key: this.text};
        });

        store('Store Commands', cmds);
    }

    function getCookie(c_name)
    {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name)
            {
                return unescape(y);
            }
        }
    }
    function getServerInstance()
    {
        var url = document.URL + "";
        var urlParseArray = url.split(".");
        var i;
        var returnUrl;

        if(url.indexOf("salesforce") != -1)
        {
            returnUrl = url.substring(0, url.indexOf("salesforce")-1);
            return returnUrl;
        }

        if(url.indexOf("visual.force") != -1)
        {
            returnUrl = 'https:// ' + urlParseArray[1];
            return returnUrl;
        }

        return returnUrl;
    }

    function initShortcuts() {

      chrome.extension.sendMessage({'action':'Get Settings'},
          function(response) {

            shortcut = response['shortcut'];
            bindShortcut(shortcut);
        }
        );

        // chrome.storage.local.get('settings', function(results) {
        //     if(typeof results.settings.shortcut === 'undefined')
        //     {
        //         shortcut = 'shift+space';
        //         bindShortcut(shortcut);
        //     }
        //     else
        //     {
        //         bindShortcut(results.settings.shortcut);
        //     }
        // });
    }
    function bindShortcut(shortcut)
    {

        Mousetrap.bindGlobal(shortcut, function(e) {
            setVisibleSearch("visible");
            return false;
        });

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('esc', function(e) {

            document.getElementById("sfnav_quickSearch").blur();
            clearOutput();
            document.getElementById("sfnav_quickSearch").value = '';

            setVisible("hidden");
            setVisibleSearch("hidden");

        });

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('enter', function(e) {
            var position = posi;
            var origText = '', newText = '';
            if(position <0) position = 0;

            origText = document.getElementById("sfnav_quickSearch").value;
            if(typeof outp.childNodes[position] != 'undefined')
            {
                newText = outp.childNodes[position].firstChild.nodeValue;

            }


            setVisible("hidden");
            if(!invokeCommand(newText))
                invokeCommand(origText);
        });

        Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('down', function(e) {
            var firstChild;
            lookAt();

            if(outp.childNodes[posi] != null)
                firstChild = outp.childNodes[posi].firstChild.nodeValue;
            else
                firstChild = null;

            var textfield = document.getElementById("sfnav_quickSearch");

            if (words.length > 0 && posi < words.length-1)
            {
                posi++;
                if(outp.childNodes[posi] != null)
                    firstChild = outp.childNodes[posi].firstChild.nodeValue;
                else
                    firstChild = null;
                if (posi >=1) outp.childNodes[posi-1].classList.remove('sfnav_selected');
                else input = textfield.value;
                outp.childNodes[posi].classList.add('sfnav_selected');
                textfield.value = firstChild;
                if(textfield.value.indexOf('<') != -1 && textfield.value.indexOf('>') != -1)
                {
                    textfield.setSelectionRange(textfield.value.indexOf('<'), textfield.value.length);
                    textfield.focus();
                    return false;
                }
            }

        });

    Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('up', function(e) {
        var firstChild;

        if(outp.childNodes[posi] != null)
            firstChild = outp.childNodes[posi].firstChild.nodeValue;
        else
            firstChild = null;

        var textfield = document.getElementById("sfnav_quickSearch");

        if (words.length > 0 && posi >= 0){
            posi--;
            if(outp.childNodes[posi] != null)
                firstChild = outp.childNodes[posi].firstChild.nodeValue;
            else
                firstChild = null;
            if (posi >=0){
                outp.childNodes[posi+1].classList.remove('sfnav_selected');
                outp.childNodes[posi].classList.add('sfnav_selected');
                textfield.value = firstChild;
            }
            else{
                outp.childNodes[posi+1].classList.remove('sfnav_selected');
                textfield.value = input;

            }
            if(textfield.value.indexOf('<') != -1 && textfield.value.indexOf('>') != -1)
            {
                textfield.setSelectionRange(textfield.value.indexOf('<'), textfield.value.length);
                textfield.focus();
                return false;
            }


        }

    });



    Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('backspace', function(e) {
        posi = -1;
        oldins=-1;
    });

    document.getElementById('sfnav_quickSearch').onkeyup = function() {

        lookAt();
        return true;
    }

    }

    function showLoadingIndicator()
    {
        document.getElementById('sfnav_loader').style.visibility = 'visible';
    }
    function hideLoadingIndicator()
    {
        document.getElementById('sfnav_loader').style.visibility = 'hidden';
    }
    function getCustomObjectsDef()
    {

        ftClient.query('Select+Id,+DeveloperName,+NamespacePrefix+FROM+CustomObject',
            function(success)
            {
                for(var i=0;i<success.records.length;i++)
                {
                    customObjects[success.records[i].DeveloperName.toLowerCase()] = {Id: success.records[i].Id};
                    var apiName = (success.records[i].NamespacePrefix == null ? '' : success.records[i].NamespacePrefix + '__') + success.records[i].DeveloperName + '__c';
                    cmds['Setup > Custom Object > ' + apiName] = {url: '/' + success.records[i].Id, key: apiName};
                }
            },
            function(error)
            {
                console.log(error);
            });

    }
    function init()
    {
        ftClient = new forceTooling.Client();
        ftClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, serverInstance + '.salesforce.com');

        var div = document.createElement('div');
        div.setAttribute('id', 'sfnav_search_box');
        var loaderURL = chrome.extension.getURL("images/ajax-loader.gif");
        div.innerHTML = '<div class="sfnav_wrapper"><input type="text" id="sfnav_quickSearch" autocomplete="off"/><img id="sfnav_loader" src= "'+ loaderURL +'"/></div><div class="sfnav_shadow" id="sfnav_shadow"/><div class="sfnav_output" id="sfnav_output"/>';
        document.body.appendChild(div);

        outp = document.getElementById("sfnav_output");
        hideLoadingIndicator();
        initShortcuts();

        clientId = getCookie('sid').split('!')[0];
        // chrome.storage.local.get(['Commands','Metadata'], function(results) {
        //     console.log(results);
        // });


        chrome.extension.sendMessage({action:'Get Commands', 'key': clientId},
          function(response) {
            cmds = response;

            if(cmds == null || cmds.length == 0)
            {
                cmds = {};
                metaData = {};

                getAllObjectMetadata();

            }
            else
            {

            }
        });

        chrome.extension.sendMessage({action:'Get Metadata', 'key': clientId},
          function(response) {
            metaData = response;
        });


    }

    init();

})();
