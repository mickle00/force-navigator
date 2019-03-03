// @copyright 2012+ Daniel Nakov / Silverline CRM
// http://silverlinecrm.com

var sfnav = (function() {
  var outp;
  var oldins;
  var posi = -1;
  var newTabKeys = [
    "ctrl+enter",
    "command+enter",
    "shift+enter"
  ]
  var input;
  var key;
  var metaData = {};
  var serverInstance = getServerInstance()
  var classicURL
  var orgId = false
  var cmds = {}
  var isCtrl = false
  var regMatchSid = /sid=([a-zA-Z0-9\.\!]+)/
  var clientId, omnomnom, hash;
  var loaded = false
  var shortcut
  var mouseClickLoginAsUserId
  var detailedMode
  var sessionId = {}
  var userId = {}
  var sid;
  var SFAPI_VERSION = 'v40.0'
  var ftClient = new forceTooling.Client()
  var customObjects = {}
  let classicToLightingMap = {
    'Fields': "/FieldsAndRelationships/view",
    'Page Layouts': '/PageLayouts/view',
    'Buttons, Links, and Actions': '/ButtonsLinksActions/view',
    'Compact Layouts': '/CompactLayouts/view',
    'Field Sets': '/FieldSets/view',
    'Limits': '/Limits/view',
    'Record Types': '/RecordTypes/view',
    'Related Lookup Filters': '/RelatedLookupFilters/view',
    'Search Layouts': '/SearchLayouts/view',
    'Triggers': '/Triggers/view',
    'Validation Rules': '/ValidationRules/view'
  }
  let setupLabelsToLightningMap = {
    "Setup Home": "/lightning/setup/SetupOneHome/home",
    "Lightning Experience Transition Assistant": "/lightning/setup/EnableLightningExperience/home",
    "Lightning Usage": "/lightning/setup/LightningUsageSetup/home",
    "Permission Sets": "/lightning/setup/PermSets/home",
    "Profiles": "/lightning/setup/Profiles/home",
    "Public Groups": "/lightning/setup/PublicGroups/home",
    "Queues": "/lightning/setup/Queues/home",
    "Roles": "/lightning/setup/Roles/home",
    "User Management Settings": "/lightning/setup/UserManagementSettings/home",
    "Users": "/lightning/setup/ManageUsers/home",
    "Big Objects": "/lightning/setup/BigObjects/home",
    "Data Export": "/lightning/setup/DataManagementExport/home",
    "Data Integration Metrics": "/lightning/setup/XCleanVitalsUi/home",
    "Data Integration Rules": "/lightning/setup/CleanRules/home",
    "Duplicate Error Logs": "/lightning/setup/DuplicateErrorLog/home",
    "Duplicate Rules": "/lightning/setup/DuplicateRules/home",
    "Matching Rules": "/lightning/setup/MatchingRules/home",
    "Mass Delete Records": "/lightning/setup/DataManagementDelete/home",
    "Mass Transfer Approval Requests": "/lightning/setup/DataManagementManageApprovals/home",
    "Mass Transfer Records": "/lightning/setup/DataManagementTransfer/home",
    "Mass Update Addresses": "/lightning/setup/DataManagementMassUpdateAddresses/home",
    "Picklist Settings": "/lightning/setup/PicklistSettings/home",
    "Schema Settings": "/lightning/setup/SchemaSettings/home",
    "State and Country/Territory Picklists": "/lightning/setup/AddressCleanerOverview/home",
    "Storage Usage": "/lightning/setup/CompanyResourceDisk/home",
    "Apex Exception Email": "/lightning/setup/ApexExceptionEmail/home",
    "Classic Email Templates": "/lightning/setup/CommunicationTemplatesEmail/home",
    "Compliance BCC Email": "/lightning/setup/SecurityComplianceBcc/home",
    "DKIM Keys": "/lightning/setup/EmailDKIMList/home",
    "Deliverability": "/lightning/setup/OrgEmailSettings/home",
    "Email Attachments": "/lightning/setup/EmailAttachmentSettings/home",
    "Email Footers": "/lightning/setup/EmailDisclaimers/home",
    "Email to Salesforce": "/lightning/setup/EmailToSalesforce/home",
    "Enhanced Email": "/lightning/setup/EnhancedEmail/home",
    "Gmail Integration and Sync": "/lightning/setup/LightningForGmailAndSyncSettings/home",
    "Letterheads": "/lightning/setup/CommunicationTemplatesLetterheads/home",
    "Lightning Email Templates": "/lightning/setup/LightningEmailTemplateSetup/home",
    "Mail Merge Templates": "/lightning/setup/CommunicationTemplatesWord/home",
    "Organization-Wide Addresses": "/lightning/setup/OrgWideEmailAddresses/home",
    "Outlook Configurations": "/lightning/setup/EmailConfigurations/home",
    "Outlook Integration and Sync": "/lightning/setup/LightningForOutlookAndSyncSettings/home",
    "Send through External Email Services": "/lightning/setup/EmailTransportServiceSetupPage/home",
    "Test Deliverability": "/lightning/setup/TestEmailDeliverability/home",
    "App Manager": "/lightning/setup/NavigationMenus/home",
    "AppExchange Marketplace": "/lightning/setup/AppExchangeMarketplace/home",
    "Connected Apps OAuth Usage": "/lightning/setup/ConnectedAppsUsage/home",
    "Manage Connected Apps": "/lightning/setup/ConnectedApplication/home",
    "Installed Packages": "/lightning/setup/ImportedPackage/home",
    "Flow Category": "/lightning/setup/FlowCategory/home",
    "Lightning Bolt Solutions": "/lightning/setup/LightningBolt/home",
    "Salesforce Branding": "/lightning/setup/Salesforce1Branding/home",
    "Salesforce Mobile Quick Start": "/lightning/setup/Salesforce1SetupSection/home",
    "Salesforce Navigation": "/lightning/setup/ProjectOneAppMenu/home",
    "Salesforce Notifications": "/lightning/setup/NotificationsSettings/home",
    "Salesforce Offline": "/lightning/setup/MobileOfflineStorageAdmin/home",
    "Salesforce Settings": "/lightning/setup/Salesforce1Settings/home",
    "Package Manager": "/lightning/setup/Package/home",
    "Communities Settings": "/lightning/setup/SparkSetupPage/home",
    "Home": "/lightning/setup/Home/home",
    "Office 365": "/lightning/setup/NetworkSettings/home",
    "Skype for Salesforce": "/lightning/setup/SkypeSetupPage/home",
    "Quip": "/lightning/setup/QuipSetupAssistant/home",
    "Asset Files": "/lightning/setup/ContentAssets/home",
    "Content Deliveries and Public Links": "/lightning/setup/ContentDistribution/home",
    "Files Connect": "/lightning/setup/ContentHub/home",
    "General Settings": "/lightning/setup/FilesGeneralSettings/home",
    "Regenerate Previews": "/lightning/setup/RegeneratePreviews/home",
    "Salesforce CRM Content": "/lightning/setup/SalesforceCRMContent/home",
    "Synonyms": "/lightning/setup/ManageSynonyms/home",
    "Case Assignment Rules": "/lightning/setup/CaseRules/home",
    "Case Auto-Response Rules": "/lightning/setup/CaseResponses/home",
    "Case Comment Triggers": "/lightning/setup/CaseCommentTriggers/home",
    "Case Team Roles": "/lightning/setup/CaseTeamRoles/home",
    "Predefined Case Teams": "/lightning/setup/CaseTeamTemplates/home",
    "Contact Roles on Cases": "/lightning/setup/CaseContactRoles/home",
    "Customer Contact Requests": "/lightning/setup/ContactRequestFlows/home",
    "Email-to-Case": "/lightning/setup/EmailToCase/home",
    "Escalation Rules": "/lightning/setup/CaseEscRules/home",
    "Feed Filters": "/lightning/setup/FeedFilterDefinitions/home",
    "Field Service Settings": "/lightning/setup/FieldServiceSettings/home",
    "Macro Settings": "/lightning/setup/MacroSettings/home",
    "Omni-Channel Settings": "/lightning/setup/OmniChannelSettings/home",
    "Snap-ins": "/lightning/setup/Snap-ins/home",
    "Social Business Rules": "/lightning/setup/SocialCustomerServiceBusinessRules/home",
    "Social Customer Service": "/lightning/setup/SocialCustomerManagementAccountSettings/home",
    "Support Processes": "/lightning/setup/CaseProcess/home",
    "Support Settings": "/lightning/setup/CaseSettings/home",
    "Web-to-Case": "/lightning/setup/CaseWebtocase/home",
    "Web-to-Case HTML Generator": "/lightning/setup/CaseWebToCaseHtmlGenerator/home",
    "Survey Settings": "/lightning/setup/SurveySettings/home",
    "Object Manager": "/lightning/setup/ObjectManager/home",
    "Picklist Value Sets": "/lightning/setup/Picklists/home",
    "Schema Builder": "/lightning/setup/SchemaBuilder/home",
    "Approval Processes": "/lightning/setup/ApprovalProcesses/home",
    "Flows": "/lightning/setup/InteractionProcesses/home",
    "Next Best Action": "/lightning/setup/NextBestAction/home",
    "Post Templates": "/lightning/setup/FeedTemplates/home",
    "Process Automation Settings": "/lightning/setup/WorkflowSettings/home",
    "Process Builder": "/lightning/setup/ProcessAutomation/home",
    "Email Alerts": "/lightning/setup/WorkflowEmails/home",
    "Field Updates": "/lightning/setup/WorkflowFieldUpdates/home",
    "Outbound Messages": "/lightning/setup/WorkflowOutboundMessaging/home",
    "Send Actions": "/lightning/setup/SendAction/home",
    "Tasks": "/lightning/setup/WorkflowTasks/home",
    "Workflow Rules": "/lightning/setup/WorkflowRules/home",
    "Action Link Templates": "/lightning/setup/ActionLinkGroupTemplates/home",
    "App Menu": "/lightning/setup/AppMenu/home",
    "Custom Labels": "/lightning/setup/ExternalStrings/home",
    "Density Settings": "/lightning/setup/DensitySetup/home",
    "Global Actions": "/lightning/setup/GlobalActions/home",
    "Publisher Layouts": "/lightning/setup/GlobalPublisherLayouts/home",
    "Guided Actions": "/lightning/setup/GuidedActions/home",
    "Lightning App Builder": "/lightning/setup/FlexiPageList/home",
    "Path Settings": "/lightning/setup/PathAssistantSetupHome/home",
    "Quick Text Settings": "/lightning/setup/LightningQuickTextSettings/home",
    "Rename Tabs and Labels": "/lightning/setup/RenameTab/home",
    "Custom URLs": "/lightning/setup/DomainSites/home",
    "Domains": "/lightning/setup/DomainNames/home",
    "Sites": "/lightning/setup/CustomDomain/home",
    "Tabs": "/lightning/setup/CustomTabs/home",
    "Themes and Branding": "/lightning/setup/ThemingAndBranding/home",
    "Export": "/lightning/setup/LabelWorkbenchExport/home",
    "Import": "/lightning/setup/LabelWorkbenchImport/home",
    "Override": "/lightning/setup/LabelWorkbenchOverride/home",
    "Translate": "/lightning/setup/LabelWorkbenchTranslate/home",
    "Translation Settings": "/lightning/setup/LabelWorkbenchSetup/home",
    "User Interface": "/lightning/setup/UserInterfaceUI/home",
    "Apex Classes": "/lightning/setup/ApexClasses/home",
    "Apex Hammer Test Results": "/lightning/setup/ApexHammerResultStatus/home",
    "Apex Settings": "/lightning/setup/ApexSettings/home",
    "Apex Test Execution": "/lightning/setup/ApexTestQueue/home",
    "Apex Test History": "/lightning/setup/ApexTestHistory/home",
    "Apex Triggers": "/lightning/setup/ApexTriggers/home",
    "Canvas App Previewer": "/lightning/setup/CanvasPreviewerUi/home",
    "Custom Metadata Types": "/lightning/setup/CustomMetadata/home",
    "Custom Permissions": "/lightning/setup/CustomPermissions/home",
    "Custom Settings": "/lightning/setup/CustomSettings/home",
    "Email Services": "/lightning/setup/EmailToApexFunction/home",
    "Debug Mode": "/lightning/setup/UserDebugModeSetup/home",
    "Lightning Components": "/lightning/setup/LightningComponentBundles/home",
    "Platform Cache": "/lightning/setup/PlatformCache/home",
    "Remote Access": "/lightning/setup/RemoteAccess/home",
    "Static Resources": "/lightning/setup/StaticResources/home",
    "Tools": "/lightning/setup/ClientDevTools/home",
    "Visualforce Components": "/lightning/setup/ApexComponents/home",
    "Visualforce Pages": "/lightning/setup/ApexPages/home",
    "Dev Hub": "/lightning/setup/DevHub/home",
    "Inbound Change Sets": "/lightning/setup/InboundChangeSet/home",
    "Outbound Change Sets": "/lightning/setup/OutboundChangeSet/home",
    "Deployment Settings": "/lightning/setup/DeploymentSettings/home",
    "Deployment Status": "/lightning/setup/DeployStatus/home",
    "Apex Flex Queue": "/lightning/setup/ApexFlexQueue/home",
    "Apex Jobs": "/lightning/setup/AsyncApexJobs/home",
    "Background Jobs": "/lightning/setup/ParallelJobsStatus/home",
    "Bulk Data Load Jobs": "/lightning/setup/AsyncApiJobStatus/home",
    "Scheduled Jobs": "/lightning/setup/ScheduledJobs/home",
    "Debug Logs": "/lightning/setup/ApexDebugLogs/home",
    "Email Log Files": "/lightning/setup/EmailLogFiles/home",
    "API Usage Notifications": "/lightning/setup/MonitoringRateLimitingNotification/home",
    "Case Escalations": "/lightning/setup/DataManagementManageCaseEscalation/home",
    "Email Snapshots": "/lightning/setup/EmailCapture/home",
    "Outbound Messages": "/lightning/setup/WorkflowOmStatus/home",
    "Time-Based Workflow": "/lightning/setup/DataManagementManageWorkflowQueue/home",
    "Sandboxes": "/lightning/setup/DataManagementCreateTestInstance/home",
    "System Overview": "/lightning/setup/SystemOverview/home",
    "Adoption Assistance": "/lightning/setup/AdoptionAssistance/home",
    "Help Menu": "/lightning/setup/HelpMenu/home",
    "API": "/lightning/setup/WebServices/home",
    "Change Data Capture": "/lightning/setup/CdcObjectEnablement/home",
    "Data Import Wizard": "/lightning/setup/DataManagementDataImporter/home",
    "Data Loader": "/lightning/setup/DataLoader/home",
    "Dataloader.io": "/lightning/setup/DataLoaderIo/home",
    "External Data Sources": "/lightning/setup/ExternalDataSource/home",
    "External Objects": "/lightning/setup/ExternalObjects/home",
    "External Services": "/lightning/setup/ExternalServices/home",
    "Platform Events": "/lightning/setup/EventObjects/home",
    "Business Hours": "/lightning/setup/BusinessHours/home",
    "Public Calendars and Resources": "/lightning/setup/Calendars/home",
    "Company Information": "/lightning/setup/CompanyProfileInfo/home",
    "Critical Updates": "/lightning/setup/CriticalUpdates/home",
    "Data Protection and Privacy": "/lightning/setup/ConsentManagement/home",
    "Fiscal Year": "/lightning/setup/ForecastFiscalYear/home",
    "Holidays": "/lightning/setup/Holiday/home",
    "Language Settings": "/lightning/setup/LanguageSettings/home",
    "Maps and Location Settings": "/lightning/setup/MapsAndLocationServicesSettings/home",
    "My Domain": "/lightning/setup/OrgDomain/home",
    "Data Classification (Beta)": "/lightning/setup/DataClassificationSettings/home",
    "Data Classification Download": "/lightning/setup/DataClassificationDownload/home",
    "Data Classification Upload": "/lightning/setup/DataClassificationUpload/home",
    "Auth. Providers": "/lightning/setup/AuthProviders/home",
    "Identity Provider": "/lightning/setup/IdpPage/home",
    "Identity Provider Event Log": "/lightning/setup/IdpErrorLog/home",
    "Identity Verification": "/lightning/setup/IdentityVerification/home",
    "Identity Verification History": "/lightning/setup/VerificationHistory/home",
    "Login Flows": "/lightning/setup/LoginFlow/home",
    "Login History": "/lightning/setup/OrgLoginHistory/home",
    "Single Sign-On Settings": "/lightning/setup/SingleSignOn/home",
    "Activations": "/lightning/setup/ActivatedIpAddressAndClientBrowsersPage/home",
    "CORS": "/lightning/setup/CorsWhitelistEntries/home",
    "CSP Trusted Sites": "/lightning/setup/SecurityCspTrustedSite/home",
    "Certificate and Key Management": "/lightning/setup/CertificatesAndKeysManagement/home",
    "Delegated Administration": "/lightning/setup/DelegateGroups/home",
    "Event Monitoring Settings": "/lightning/setup/EventMonitoringSetup/home",
    "Expire All Passwords": "/lightning/setup/SecurityExpirePasswords/home",
    "Field Accessibility": "/lightning/setup/FieldAccessibility/home",
    "File Upload and Download Security": "/lightning/setup/FileTypeSetting/home",
    "Health Check": "/lightning/setup/HealthCheck/home",
    "Login Access Policies": "/lightning/setup/LoginAccessPolicies/home",
    "Named Credentials": "/lightning/setup/NamedCredential/home",
    "Network Access": "/lightning/setup/NetworkAccess/home",
    "Password Policies": "/lightning/setup/SecurityPolicies/home",
    "Remote Site Settings": "/lightning/setup/SecurityRemoteProxy/home",
    "Session Management": "/lightning/setup/SessionManagementPage/home",
    "Session Settings": "/lightning/setup/SecuritySession/home",
    "Sharing Settings": "/lightning/setup/SecuritySharing/home",
    "View Setup Audit Trail": "/lightning/setup/SecurityEvents/home",
    "Optimizer": "/lightning/setup/SalesforceOptimizer/home"
  }

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
      mouseClickLoginAsUserId = this.getAttribute("id");
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
      invokeCommand(this.firstChild.nodeValue,false,'click');
      return true;
    }

  var mouseClickLoginAs = function() {
    loginAsPerform(mouseClickLoginAsUserId)
    return true
  }

  function getSingleObjectMetadata() {
    var recordId = document.URL.split('/')[3]
    var keyPrefix = recordId.substring(0,3)
  }

  function getVisible() { return document.getElementById("sfnav_shadow").style.visibility }
  function isVisible() { return document.getElementById("sfnav_shadow").style.visibility !== 'hidden' }
  function setVisible(visi){
    var x = document.getElementById("sfnav_shadow");
    x.style.position = 'relative';
    x.style.visibility = visi;
  }
  function isVisibleSearch() { return document.getElementById("sfnav_quickSearch").style.visibility !== 'hidden' }
  function setVisibleSearch(visi) {
    var t = document.getElementById("sfnav_search_box")
    t.style.visibility = visi
    if(visi=='visible') document.getElementById("sfnav_quickSearch").focus()
  }

  function lookAt() {
    let newSearchVal = document.getElementById('sfnav_quickSearch').value
    if(newSearchVal !== '') {
      addElements(newSearchVal)
    } else {
      document.querySelector('#sfnav_output').innerHTML = ''
      setVisible("hidden")
      posi = -1
    }
  }
  function addElements(ins) {
    if(ins[0] == "?") {
      clearOutput()
      addWord('Global Search Usage: ? <Search term(s)>')
      setVisible('visible')
    }
    else if(ins.substring(0,9) == 'login as ' && !serverInstance.includes('.force.com')) {
      clearOutput()
      addWord('Usage: login as <FirstName> <LastName> OR <Username>')
      setVisible('visible')
    }
    else {
      words = fastGetWord(ins, cmds)
      if(words.length > 0) {
        clearOutput()
        for (var i=0;i<words.length; ++i)
          addWord(words[i])
        setVisible("visible")
        input = document.getElementById("sfnav_quickSearch").value
      } else {
        clearOutput()
        setVisible("hidden")
        posi = -1
      }
    }
    var firstEl = document.querySelector('#sfnav_output :first-child')
    if(posi == -1 && firstEl != null) firstEl.className = "sfnav_child sfnav_selected"
  }

  var fastGetWord = function(input, dict) {
    if(typeof input === 'undefined' || input == '') return []
    var words = []
    var arrFound = []
    var terms = input.toLowerCase().split(" ")
    for (var key in dict) {
      if(arrFound.length > 10) break // stop at 10 since we can't see longer than that anyways - should make this a setting
      if(key.toLowerCase().indexOf(input) != -1) {
          arrFound.push({num: 10, key: key})
      } else {
        let match = 0
        for(var i = 0;i<terms.length;i++) {
          if(key.toLowerCase().indexOf(terms[i]) != -1) {
            match++
            sortValue = 1
          }
        }
        if (match == terms.length)
          arrFound.push({num : sortValue, key : key})
      }
    }
    arrFound.sort(function(a,b) { return b.num - a.num })
    for(var i = 0;i<arrFound.length;i++)
      words[words.length] = arrFound[i].key
    return words    
  } 

  function getWord(beginning, dict) {
    var words = []
    if(typeof beginning === 'undefined') return []
    var tmpSplit = beginning.split(' ')
    var match = false
    if(beginning.length == 0) {
      for (var key in dict)
        words.push(key)
      return words
    }
    var arrFound = []
    for (var key in dict) {
      match = false
      if(key.toLowerCase().indexOf(beginning) != -1) {
          arrFound.push({num : 10,key : key})
      } else {
        for(var i = 0;i<tmpSplit.length;i++) {
          if(key.toLowerCase().indexOf(tmpSplit[i].toLowerCase()) != -1) {
            match = true
            sortValue = 1
          } else {
            match = false
            if(dict[key]['synonyms'] !== undefined) {
              for(var j = 0;j<dict[key]['synonyms'].length;j++) {
                keySynonym = dict[key]['synonyms'][j]
                if(keySynonym.toLowerCase().indexOf(tmpSplit[i].toLowerCase()) != -1) {
                    match = true
                    sortValue = 0.5
                }
              }
            }
          }
          if (!match) { break }
        }
        if(match) arrFound.push({num : sortValue, key : key})
      }
    }
    arrFound.sort(function(a,b) { return b.num - a.num })
    for(var i = 0;i<arrFound.length;i++)
      words[words.length] = arrFound[i].key

    return words;
  }


  function addWord(word) {
    var d = document.createElement("div");
    var sp;
    if(cmds[word] != null && cmds[word].url != null && cmds[word].url != "") {
      sp = document.createElement("a");
      sp.setAttribute("href", cmds[word].url);

    } else {
      sp = d;
    }

    if(cmds[word] != null && cmds[word].id != null && cmds[word].id != "") {
      sp.id = cmds[word].id;
    }

    sp.classList.add('sfnav_child');
    sp.appendChild(document.createTextNode(word));
    sp.onmouseover = mouseHandler;
    sp.onmouseout = mouseHandlerOut;
    sp.onclick = mouseClick;
    if(sp.id && sp.length > 0){
      sp.onclick = mouseClickLoginAs;
    }
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

  function clearOutput() {
    if(typeof outp != 'undefined')
      {
        while (outp.hasChildNodes()){
          noten=outp.firstChild;
          outp.removeChild(noten);
        }
      }
  }
  function setColor (_posi, _color, _forg){
    outp.childNodes[_posi].style.background = _color;
    outp.childNodes[_posi].style.color = _forg;
  }

  function invokeCommand(cmd, newtab, event) {
    if(cmd == "") { return false }
    var targetURL = ""
    if(cmd.toLowerCase() == 'refresh metadata') {
      showLoadingIndicator()
      var req = {}
      req.action = 'Clear Commands'
      req.key = getCmdHash()
      chrome.runtime.sendMessage(req, function(response) {})
      getAllObjectMetadata(true)
      document.getElementById("sfnav_quickSearch").value = ""
      return true
    }
    else if(cmd.toLowerCase() == 'toggle detailed mode') {
      chrome.runtime.sendMessage({ action: 'Toggle Detailed Mode', key: getCmdHash() }, function(response) {
        getAllObjectMetadata()
        window.location.reload()
      })
      return true
    }
    else if(cmd.toLowerCase() == 'toggle lightning') {
      var mode
      if(window.location.href.includes("lightning.force"))
        mode = "classic"
      else
        mode = "lex-campaign"
      window.location.href = serverInstance + "/ltng/switcher?destination=" + mode
      return true
    }
    else if(cmd.toLowerCase().substring(0,9) == 'login as ' && !serverInstance.includes('.force.com')) { loginAs(cmd); return true }

    else if(event != 'click' && typeof cmds[cmd] != 'undefined' && cmds[cmd].url) { targetURL = cmds[cmd].url }
    else if(cmd.toLowerCase() == 'setup') { targetURL = serverInstance + '/ui/setup/Setup' }
    else if(cmd.toLowerCase() == 'home') { targetURL = serverInstance + "/" }
    // else if(cmd[0] == "!") { createTask(cmd.substring(1).trim()) }
    else if(cmd[0] == "?") {
      targetURL = serverInstance
      var TERM = cmd.substring(1).trim()
      if(serverInstance.includes('.force.com')) {
          targetURL += "/one/one.app#" + btoa(JSON.stringify({"componentDef":"forceSearch:search","attributes":{"term": TERM,"scopeMap":{"type":"TOP_RESULTS"},"context":{"disableSpellCorrection":false,"SEARCH_ACTIVITY":{"term": TERM}}}}))
      } else { targetURL += "/_ui/search/ui/UnifiedSearchResults?sen=ka&sen=500&str=" + encodeURI(TERM) + "#!/str=" + encodeURI(TERM) + "&searchAll=true&initialViewMode=summary" }
    }
    else { console.log(cmd + " not found in command list or incompatible"); return false }

    if(targetURL != "") {
      if(newtab) {
        var w = window.open(targetURL, "").focus()
        hideSearchBox()
      } else { window.location.href = targetURL }
      return true
    } else { return false }
}

  function store(action, payload) {
    var req = {}
    req.action = action;
    req.key = getCmdHash();
    req.payload = payload;

    chrome.runtime.sendMessage(req, function(response) {});
  }

  var getUserId = function() {
    return userId[orgId]
  }
  var createTask = function(subject) {
    showLoadingIndicator()
    if(subject != "" && getUserId()) {
      // function(path, callback, error, method, payload, retry) {
      ftClient.ajax(
        SFAPI_VERSION + '/sobjects/Task',
        function (success) {
          console.log(success)
        },
        function(error) { console.log(error) },
        "POST",
        {"Subject": subject, "OwnerId": getUserId()}
      )
    }
  }

  function loginAs(cmd) {
    var arrSplit = cmd.split(' ')
    var searchValue = arrSplit[2]
    if(arrSplit[3] !== undefined)
      searchValue += '+' + arrSplit[3]
    var query = 'SELECT+Id,+Name,+Username+FROM+User+WHERE+Name+LIKE+\'%25' + searchValue + '%25\'+OR+Username+LIKE+\'%25' + searchValue + '%25\''
    showLoadingIndicator()
    ftClient.query(query,
      function(success) {
        hideLoadingIndicator()
        var numberOfUserRecords = success.records.length
        if(numberOfUserRecords < 1) { addError([{"message":"No user for your search exists."}]) }
        else if(numberOfUserRecords > 1) { loginAsShowOptions(success.records) }
        else {
          var userId = success.records[0].Id
          loginAsPerform(userId)
        }
      },
      function(error) {
        console.log(error);
        hideLoadingIndicator()
        addError(error.responseJSON)
      }
    )
  }

  function loginAsShowOptions(records) {
    for(var i = 0; i < records.length; ++i) {
      var cmd = 'Login As ' + records[i].Name
      cmds[cmd] = {key: cmd, id: records[i].Id}
      addWord(cmd)
    }
    setVisible('visible')
  }

  function loginAsPerform(userId) {
    xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
        document.write(xmlhttp.responseText)
        document.close()
        setTimeout(function() {
          document.getElementsByName("login")[0].click();
        }, 1000)
      }
    }
    xmlhttp.open("GET", 'https://' + classicURL + '/' + userId + '?noredirect=1', true)
    xmlhttp.send()
  }

  function getMetadata(_data) {
    if(_data.length == 0) return;
    var data = JSON.parse(_data)
    var mRecord = {}
    var act = {}
    metaData = {}
    if(typeof data.sobjects != "undefined") {
        data.sobjects.map( obj => {
          if(obj.keyPrefix != null) {
            mRecord = {label, labelPlural, keyPrefix, urls} = obj
            metaData[obj.keyPrefix] = mRecord
            cmds['List ' + mRecord.labelPlural] = {
              key: obj.name,
              keyPrefix: obj.keyPrefix,
              url: serverInstance + '/' + obj.keyPrefix
            }
            // cmds['List ' + mRecord.labelPlural]['synonyms'] = [obj.name]
            cmds['New ' + mRecord.label] = {
              key: obj.name,
              keyPrefix: obj.keyPrefix,
              url: serverInstance + '/' + obj.keyPrefix + '/e',
            }
            // cmds['New ' + mRecord.label]['synonyms'] = [obj.name]
          }
        })
    }
    store('Store Commands', cmds)
    hideLoadingIndicator()
  }

  function getAllObjectMetadata(force) {
    serverInstance = getServerInstance()
    cmds['Refresh Metadata'] = {}
    cmds['Toggle Detailed Mode'] = {}
    cmds['Toggle Lightning'] = {}
    cmds['Setup'] = {}
    cmds['?'] = {}
    // cmds['/'] = {}  //prepping for listview searching
    // Lightning link: serverInstance + "/lightning/o/"+ sObject +"/list?filterName=" + List ID
    // no apparent way to SOQL for specific name view, seems to be on a per object basis only
    // classicURL + "/vXX.X/sobjects/{sobjectType}/listviews"
    // probably offer list search on several specific objects - ooh, or as a configuarion setting you can change
    // ------
    // cmds['!'] = {}  //prepping for adding tasks to self - very simple task creation
    // REST Api for creation
    // json object: { "Subject": taskSubject, "OwnerId": getUserId() }
    cmds['Home'] = {}
    getSetupTree()
    var token = getApiSessionId(force)
    while(token == '' || typeof token == "undefined") {
      token = getApiSessionId()
    }
    sid = "Bearer " + token
    var theurl = getServerInstance() + '/services/data/' + SFAPI_VERSION + '/sobjects/'
    var req = new XMLHttpRequest()
    req.open("GET", theurl, true)
    req.setRequestHeader("Authorization", sid)
    req.setRequestHeader("Accept", "application/json")
    req.onload = function(response) { getMetadata(response.target.responseText) }
    req.send()
    getCustomObjects() // switching to the old way because it is more performant and simple
    // getCustomObjectsDef()
  }
  function getCustomObjectsDef() {
// currently unused
    ftClient.query('Select+Id,+DeveloperName,+NamespacePrefix+FROM+CustomObject',
      function(success) {
        for(var i=0;i<success.records.length;i++) {
          customObjects[success.records[i].DeveloperName.toLowerCase()] = {Id: success.records[i].Id};
          var apiName = (success.records[i].NamespacePrefix == null ? '' : success.records[i].NamespacePrefix + '__') + success.records[i].DeveloperName + '__c';
          cmds['Setup > Custom Object > ' + apiName] = {url: '/' + success.records[i].Id, key: apiName};
        }
      },
      function(error) {
        getCustomObjects()
      })
  }

  function parseSetupTree(html) {
    var textLeafSelector = '.setupLeaf > a[id*="_font"]';
    var all = html.querySelectorAll(textLeafSelector);
    var strName;
    var as;
    var strNameMain;
    var strName;
    [].map.call(all, function(item) {
      var hasTopParent = false, hasParent = false;
      var parent, topParent;
      var parentEl, topParentEl;

      if (item.parentElement != null && item.parentElement.parentElement != null && item.parentElement.parentElement.parentElement != null
          && item.parentElement.parentElement.parentElement.className.indexOf('parent') !== -1) {
        hasParent = true;
        parentEl = item.parentElement.parentElement.parentElement;
        parent = parentEl.querySelector('.setupFolder').innerText;
      }
      if(hasParent && parentEl.parentElement != null && parentEl.parentElement.parentElement != null
         && parentEl.parentElement.parentElement.className.indexOf('parent') !== -1) {
        hasTopParent = true;
        topParentEl = parentEl.parentElement.parentElement;
        topParent = topParentEl.querySelector('.setupFolder').innerText;
      }

      strNameMain = 'Setup > ' + (hasTopParent ? (topParent + ' > ') : '');
      strNameMain += (hasParent ? (parent + ' > ') : '');

      strName = strNameMain + item.innerText;
      let theurl = item.href
      if(serverInstance.includes("lightning.force") && Object.keys(setupLabelsToLightningMap).includes(item.innerText)) {
        theurl = serverInstance + setupLabelsToLightningMap[item.innerText]
      }
      if(serverInstance.includes("lightning.force") && strNameMain.includes("Customize") && Object.keys(classicToLightingMap).includes(item.innerText)) {
        if(cmds['List ' + parent ] == null) { cmds['List ' + parent ] = {url: serverInstance + "/lightning/o/" + pluralize(parent, 1).replace(/\s/g,"") + "/list", key: "List " + parent} }
        if(cmds['New ' + pluralize(parent, 1) ] == null) { cmds['New ' + pluralize(parent, 1) ] = {url: serverInstance + "/lightning/o/" + pluralize(parent, 1).replace(/\s/g,"") + "/new", key: "New " + pluralize(parent, 1)} }
        theurl = serverInstance + "/lightning/setup/ObjectManager/" + pluralize(parent, 1).replace(/\s/g, "")
        theurl += classicToLightingMap[item.innerText]
      }

      if(cmds[strName] == null) cmds[strName] = {url: theurl, key: strName};
    })
    store('Store Commands', cmds)
  }

  function parseCustomObjectTree(html) {
    let mapKeys = Object.keys(classicToLightingMap)
    jQuery(html).find('th a').each(function(el) {
      if(serverInstance.includes("lightning.force")) {
        let objectId = this.href.match(/\/(\w+)\?/)[1]
        let theurl = serverInstance + "/lightning/setup/ObjectManager/" + objectId
        if(detailedMode) {
          cmds['Setup > Custom Object > ' + this.text + ' > Details'] = {url: theurl + "/Details/view", key: this.text + " > Fields"};
          for (var i = 0; i < mapKeys.length; i++) {
            let key = mapKeys[i]
            let urlElement = classicToLightingMap[ key ]
            cmds['Setup > Custom Object > ' + this.text + ' > ' + key] = {url: theurl + urlElement, key: this.text + " > " + key}
          }
        } else {
          cmds['Setup > Custom Object > ' + this.text] = {url: theurl + "/Details/view", key: this.text };
        }
      } else {
        cmds['Setup > Custom Object > ' + this.text] = {url: this.href, key: this.text};
      }
    })
    store('Store Commands', cmds)
  }

  function getSetupTree() {
    var theurl = serverInstance + '/ui/setup/Setup'
    var req = new XMLHttpRequest()
    req.onload = function() {
      classicURL = this.responseURL.match(/:\/\/(.*)salesforce.com/)[1] + "salesforce.com"
      parseSetupTree(this.response)
      hideLoadingIndicator()
    }
    req.open("GET", theurl)
    req.responseType = 'document'
    req.send()
  }

  function getCustomObjects() {
    var theurl = serverInstance + '/p/setup/custent/CustomObjectsPage'
    var req = new XMLHttpRequest()
    req.onload = function() { parseCustomObjectTree(this.response) }
    req.open("GET", theurl)
    req.responseType = 'document'
    req.send()
  }

  function getServerInstance() {
    var url = location.origin + "";
    var urlParseArray = url.split(".");
    var i;
    var returnUrl;

    if(url.indexOf("lightning.force") != -1) {
      returnUrl = url.substring(0, url.indexOf("lightning.force")) + "lightning.force.com";
    }
    else if(url.indexOf("salesforce") != -1) {
      returnUrl = url.substring(0, url.indexOf("salesforce")) + "salesforce.com";
    }
    else if(url.indexOf("cloudforce") != -1) {
      returnUrl = url.substring(0, url.indexOf("cloudforce")) + "cloudforce.com";
    }
    else if(url.indexOf("visual.force") != -1) {
      returnUrl = 'https://' + urlParseArray[1] + '';
    }
    return returnUrl;
  }
  var setCurrentOrgId = function(force) {
    if(orgId && !force) { return orgId }

    try { orgId = document.cookie.match(/sid=([\w\d]+)/)[1]; return orgId }
    catch(e) { console.log(e) }
  }
  var getApiSessionId = function(force, orgId) {
    orgId = setCurrentOrgId()

    if(sessionId[orgId] != null && force != true) return sessionId[orgId]
    if(serverInstance.includes('.force.com') || true /*forcing all to run this now */) {
      chrome.runtime.sendMessage({ action: 'Get API Session ID', key: orgId }, function(response) {
        if(response.error) {
          console.log("response", orgId, response)
          console.log(chrome.runtime.lastError)
        }
        else {
          sessionId[orgId] = unescape(response.sessionId)
          userId[orgId] = unescape(response.userId)
          if(!loaded)
            init()
          return unescape(sessionId[orgId])
        }
      })
    }
/* just using the background method right now, this isn't working in classic
    else {
      if(sessionId[orgId] == null)
        sessionId[orgId] = unescape(document.cookie.match(regMatchSid)[1])
      ftClient.setSessionToken( sessionId[orgId], SFAPI_VERSION, serverInstance + '')
      if(!loaded)
        init()
      return unescape(sessionId[orgId])
    }
*/
  }


  function initSettings() {
    chrome.runtime.sendMessage({'action':'Get Settings'},
      function(response) {
        if (response !== undefined) {
          shortcut = response['shortcut']
          bindShortcut(shortcut)
          if(detailedMode != response['detailedMode']) {
            detailedMode = response['detailedMode']
            cmds = {}
            metaData = {}
            getAllObjectMetadata()
          }
        }
      }
    )
  }

  function kbdCommand(e, key) {
    var position = posi
    var origText = '', newText = ''
    if(position <0) position = 0
    origText = document.getElementById("sfnav_quickSearch").value
    if(typeof outp.childNodes[position] != 'undefined') {
      newText = outp.childNodes[position].firstChild.nodeValue
    }
    var newtab = newTabKeys.indexOf(key) >= 0 ? true : false
    if(!newtab) {
      clearOutput()
      setVisible("hidden")
    }
    if(!invokeCommand(newText, newtab))
      invokeCommand(origText, newtab)
  }

  function selectMove(direction) {
    let searchBar = document.getElementById('sfnav_quickSearch');

    var firstChild;

    if(outp.childNodes[posi] != null)
      firstChild = outp.childNodes[posi].firstChild.nodeValue;
    else
      firstChild = null;

    let textfield = searchBar;
    let isLastPos = direction == 'down' ? posi < words.length-1 : posi >= 0

    if (words.length > 0 && isLastPos) {
      if(posi < 0) posi = 0;
      posi = posi + (direction == 'down' ? 1 : -1);
      if(outp.childNodes[posi] != null)
        firstChild = outp.childNodes[posi].firstChild.nodeValue;
      else
        firstChild = null;
      if (posi >=0) {
        outp.childNodes[posi + (direction == 'down' ? -1 : 1) ].classList.remove('sfnav_selected');
        outp.childNodes[posi].classList.add('sfnav_selected');
        outp.childNodes[posi].scrollIntoViewIfNeeded();
        textfield.value = firstChild;
        return false
        //if(textfield.value.indexOf('<') != -1 && textfield.value.indexOf('>') != -1) {
          //textfield.setSelectionRange(textfield.value.indexOf('<'), textfield.value.length);
          //textfield.focus();
         // return false;
        //}
      }
    }
  }

  function bindShortcut(shortcut) {
    let searchBar = document.getElementById('sfnav_quickSearch')
    Mousetrap.bindGlobal(shortcut, function(e) {
      setVisibleSearch("visible");
      return false;
    })
    Mousetrap.bindGlobal('esc', function(e) {
      if (isVisible() || isVisibleSearch()) {
        hideSearchBox()
      }
    })
    Mousetrap.wrap(searchBar).bind('enter', kbdCommand)
    for (var i = 0; i < newTabKeys.length; i++) {
      Mousetrap.wrap(searchBar).bind(newTabKeys[i], kbdCommand)
    }
    Mousetrap.wrap(searchBar).bind('down', selectMove.bind(this, 'down'))
    Mousetrap.wrap(searchBar).bind('up', selectMove.bind(this, 'up'))
    Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('backspace', function(e) {
      posi = -1
      oldins=-1
    })
    document.getElementById('sfnav_quickSearch').oninput = function(e) {
      lookAt()
      return true
    }
  }

  function showLoadingIndicator() { document.getElementById('sfnav_loader').style.visibility = 'visible' }
  function hideLoadingIndicator() { document.getElementById('sfnav_loader').style.visibility = 'hidden' }
  var hideSearchBox = function() {
    let searchBar = document.getElementById('sfnav_quickSearch')
    searchBar.blur()
    clearOutput()
    searchBar.value = ''
    setVisible("hidden")
    setVisibleSearch("hidden")
  }

  var getCmdHash = function() {
    omnomnom = document.cookie.match(regMatchSid)[1]
    clientId = omnomnom.split('!')[0]
    hash = clientId + '!' + omnomnom.substring(omnomnom.length - 10, omnomnom.length)
    return hash
  }

  function init() {
    if(document.body != null) {
      setCurrentOrgId()
      if(sessionId[orgId] == undefined) { getApiSessionId(true, orgId) }
      else { ftClient.setSessionToken( sessionId[orgId], SFAPI_VERSION, serverInstance + '') }

      var div = document.createElement('div');
      div.setAttribute('id', 'sfnav_search_box');
      var loaderURL = chrome.extension.getURL("images/ajax-loader.gif");
      var logoURL = chrome.extension.getURL("images/sfnav-128.png");
      div.innerHTML = `
      <div class="sfnav_wrapper">
        <input type="text" id="sfnav_quickSearch" autocomplete="off"/>
        <img id="sfnav_loader" src= "${loaderURL}"/>
        <img id="sfnav_logo" src= "${logoURL}"/>
      </div>
      <div class="sfnav_shadow" id="sfnav_shadow"/>
      <div class="sfnav_output" id="sfnav_output"/>`;

      document.body.appendChild(div);
      outp = document.getElementById("sfnav_output")
      hideLoadingIndicator()
      initSettings()
      hash = getCmdHash()
      loaded = true

      chrome.runtime.sendMessage({
        action:'Get Commands', 'key': hash},
        function(response) {
          cmds = response
          if(cmds == null || cmds.length == 0) {
            cmds = {}
            metaData = {}
            getAllObjectMetadata()
          }
      })
    }
  }

  if(serverInstance == null) {
    console.log('error', getServerInstance(), getApiSessionId())
    return
  }
  else getApiSessionId()
})()