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
  var serverInstance = getServerInstance();
  var cmds = {};
  var isCtrl = false;
  var clientId, omnomnom, hash;
  var loaded=false;
  var shortcut;
  var detailedMode
  var sid;
  var SFAPI_VERSION = 'v33.0';
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
    "Setup Home": "https://jstart.lightning.force.com/lightning/setup/SetupOneHome/home",
    "Lightning Experience Transition Assistant": "https://jstart.lightning.force.com/lightning/setup/EnableLightningExperience/home",
    "Lightning Usage": "https://jstart.lightning.force.com/lightning/setup/LightningUsageSetup/home",
    "Permission Sets": "https://jstart.lightning.force.com/lightning/setup/PermSets/home",
    "Profiles": "https://jstart.lightning.force.com/lightning/setup/Profiles/home",
    "Public Groups": "https://jstart.lightning.force.com/lightning/setup/PublicGroups/home",
    "Queues": "https://jstart.lightning.force.com/lightning/setup/Queues/home",
    "Roles": "https://jstart.lightning.force.com/lightning/setup/Roles/home",
    "User Management Settings": "https://jstart.lightning.force.com/lightning/setup/UserManagementSettings/home",
    "Users": "https://jstart.lightning.force.com/lightning/setup/ManageUsers/home",
    "Big Objects": "https://jstart.lightning.force.com/lightning/setup/BigObjects/home",
    "Data Export": "https://jstart.lightning.force.com/lightning/setup/DataManagementExport/home",
    "Data Integration Metrics": "https://jstart.lightning.force.com/lightning/setup/XCleanVitalsUi/home",
    "Data Integration Rules": "https://jstart.lightning.force.com/lightning/setup/CleanRules/home",
    "Duplicate Error Logs": "https://jstart.lightning.force.com/lightning/setup/DuplicateErrorLog/home",
    "Duplicate Rules": "https://jstart.lightning.force.com/lightning/setup/DuplicateRules/home",
    "Matching Rules": "https://jstart.lightning.force.com/lightning/setup/MatchingRules/home",
    "Mass Delete Records": "https://jstart.lightning.force.com/lightning/setup/DataManagementDelete/home",
    "Mass Transfer Approval Requests": "https://jstart.lightning.force.com/lightning/setup/DataManagementManageApprovals/home",
    "Mass Transfer Records": "https://jstart.lightning.force.com/lightning/setup/DataManagementTransfer/home",
    "Mass Update Addresses": "https://jstart.lightning.force.com/lightning/setup/DataManagementMassUpdateAddresses/home",
    "Picklist Settings": "https://jstart.lightning.force.com/lightning/setup/PicklistSettings/home",
    "Schema Settings": "https://jstart.lightning.force.com/lightning/setup/SchemaSettings/home",
    "State and Country/Territory Picklists": "https://jstart.lightning.force.com/lightning/setup/AddressCleanerOverview/home",
    "Storage Usage": "https://jstart.lightning.force.com/lightning/setup/CompanyResourceDisk/home",
    "Apex Exception Email": "https://jstart.lightning.force.com/lightning/setup/ApexExceptionEmail/home",
    "Classic Email Templates": "https://jstart.lightning.force.com/lightning/setup/CommunicationTemplatesEmail/home",
    "Compliance BCC Email": "https://jstart.lightning.force.com/lightning/setup/SecurityComplianceBcc/home",
    "DKIM Keys": "https://jstart.lightning.force.com/lightning/setup/EmailDKIMList/home",
    "Deliverability": "https://jstart.lightning.force.com/lightning/setup/OrgEmailSettings/home",
    "Email Attachments": "https://jstart.lightning.force.com/lightning/setup/EmailAttachmentSettings/home",
    "Email Footers": "https://jstart.lightning.force.com/lightning/setup/EmailDisclaimers/home",
    "Email to Salesforce": "https://jstart.lightning.force.com/lightning/setup/EmailToSalesforce/home",
    "Enhanced Email": "https://jstart.lightning.force.com/lightning/setup/EnhancedEmail/home",
    "Gmail Integration and Sync": "https://jstart.lightning.force.com/lightning/setup/LightningForGmailAndSyncSettings/home",
    "Letterheads": "https://jstart.lightning.force.com/lightning/setup/CommunicationTemplatesLetterheads/home",
    "Lightning Email Templates": "https://jstart.lightning.force.com/lightning/setup/LightningEmailTemplateSetup/home",
    "Mail Merge Templates": "https://jstart.lightning.force.com/lightning/setup/CommunicationTemplatesWord/home",
    "Organization-Wide Addresses": "https://jstart.lightning.force.com/lightning/setup/OrgWideEmailAddresses/home",
    "Outlook Configurations": "https://jstart.lightning.force.com/lightning/setup/EmailConfigurations/home",
    "Outlook Integration and Sync": "https://jstart.lightning.force.com/lightning/setup/LightningForOutlookAndSyncSettings/home",
    "Send through External Email Services": "https://jstart.lightning.force.com/lightning/setup/EmailTransportServiceSetupPage/home",
    "Test Deliverability": "https://jstart.lightning.force.com/lightning/setup/TestEmailDeliverability/home",
    "App Manager": "https://jstart.lightning.force.com/lightning/setup/NavigationMenus/home",
    "AppExchange Marketplace": "https://jstart.lightning.force.com/lightning/setup/AppExchangeMarketplace/home",
    "Connected Apps OAuth Usage": "https://jstart.lightning.force.com/lightning/setup/ConnectedAppsUsage/home",
    "Manage Connected Apps": "https://jstart.lightning.force.com/lightning/setup/ConnectedApplication/home",
    "Installed Packages": "https://jstart.lightning.force.com/lightning/setup/ImportedPackage/home",
    "Flow Category": "https://jstart.lightning.force.com/lightning/setup/FlowCategory/home",
    "Lightning Bolt Solutions": "https://jstart.lightning.force.com/lightning/setup/LightningBolt/home",
    "Salesforce Branding": "https://jstart.lightning.force.com/lightning/setup/Salesforce1Branding/home",
    "Salesforce Mobile Quick Start": "https://jstart.lightning.force.com/lightning/setup/Salesforce1SetupSection/home",
    "Salesforce Navigation": "https://jstart.lightning.force.com/lightning/setup/ProjectOneAppMenu/home",
    "Salesforce Notifications": "https://jstart.lightning.force.com/lightning/setup/NotificationsSettings/home",
    "Salesforce Offline": "https://jstart.lightning.force.com/lightning/setup/MobileOfflineStorageAdmin/home",
    "Salesforce Settings": "https://jstart.lightning.force.com/lightning/setup/Salesforce1Settings/home",
    "Package Manager": "https://jstart.lightning.force.com/lightning/setup/Package/home",
    "Communities Settings": "https://jstart.lightning.force.com/lightning/setup/SparkSetupPage/home",
    "Home": "https://jstart.lightning.force.com/lightning/setup/Home/home",
    "Office 365": "https://jstart.lightning.force.com/lightning/setup/NetworkSettings/home",
    "Skype for Salesforce": "https://jstart.lightning.force.com/lightning/setup/SkypeSetupPage/home",
    "Quip": "https://jstart.lightning.force.com/lightning/setup/QuipSetupAssistant/home",
    "Asset Files": "https://jstart.lightning.force.com/lightning/setup/ContentAssets/home",
    "Content Deliveries and Public Links": "https://jstart.lightning.force.com/lightning/setup/ContentDistribution/home",
    "Files Connect": "https://jstart.lightning.force.com/lightning/setup/ContentHub/home",
    "General Settings": "https://jstart.lightning.force.com/lightning/setup/FilesGeneralSettings/home",
    "Regenerate Previews": "https://jstart.lightning.force.com/lightning/setup/RegeneratePreviews/home",
    "Salesforce CRM Content": "https://jstart.lightning.force.com/lightning/setup/SalesforceCRMContent/home",
    "Synonyms": "https://jstart.lightning.force.com/lightning/setup/ManageSynonyms/home",
    "Case Assignment Rules": "https://jstart.lightning.force.com/lightning/setup/CaseRules/home",
    "Case Auto-Response Rules": "https://jstart.lightning.force.com/lightning/setup/CaseResponses/home",
    "Case Comment Triggers": "https://jstart.lightning.force.com/lightning/setup/CaseCommentTriggers/home",
    "Case Team Roles": "https://jstart.lightning.force.com/lightning/setup/CaseTeamRoles/home",
    "Predefined Case Teams": "https://jstart.lightning.force.com/lightning/setup/CaseTeamTemplates/home",
    "Contact Roles on Cases": "https://jstart.lightning.force.com/lightning/setup/CaseContactRoles/home",
    "Customer Contact Requests": "https://jstart.lightning.force.com/lightning/setup/ContactRequestFlows/home",
    "Email-to-Case": "https://jstart.lightning.force.com/lightning/setup/EmailToCase/home",
    "Escalation Rules": "https://jstart.lightning.force.com/lightning/setup/CaseEscRules/home",
    "Feed Filters": "https://jstart.lightning.force.com/lightning/setup/FeedFilterDefinitions/home",
    "Field Service Settings": "https://jstart.lightning.force.com/lightning/setup/FieldServiceSettings/home",
    "Macro Settings": "https://jstart.lightning.force.com/lightning/setup/MacroSettings/home",
    "Omni-Channel Settings": "https://jstart.lightning.force.com/lightning/setup/OmniChannelSettings/home",
    "Snap-ins": "https://jstart.lightning.force.com/lightning/setup/Snap-ins/home",
    "Social Business Rules": "https://jstart.lightning.force.com/lightning/setup/SocialCustomerServiceBusinessRules/home",
    "Social Customer Service": "https://jstart.lightning.force.com/lightning/setup/SocialCustomerManagementAccountSettings/home",
    "Support Processes": "https://jstart.lightning.force.com/lightning/setup/CaseProcess/home",
    "Support Settings": "https://jstart.lightning.force.com/lightning/setup/CaseSettings/home",
    "Web-to-Case": "https://jstart.lightning.force.com/lightning/setup/CaseWebtocase/home",
    "Web-to-Case HTML Generator": "https://jstart.lightning.force.com/lightning/setup/CaseWebToCaseHtmlGenerator/home",
    "Survey Settings": "https://jstart.lightning.force.com/lightning/setup/SurveySettings/home",
    "Object Manager": "https://jstart.lightning.force.com/lightning/setup/ObjectManager/home",
    "Picklist Value Sets": "https://jstart.lightning.force.com/lightning/setup/Picklists/home",
    "Schema Builder": "https://jstart.lightning.force.com/lightning/setup/SchemaBuilder/home",
    "Approval Processes": "https://jstart.lightning.force.com/lightning/setup/ApprovalProcesses/home",
    "Flows": "https://jstart.lightning.force.com/lightning/setup/InteractionProcesses/home",
    "Next Best Action": "https://jstart.lightning.force.com/lightning/setup/NextBestAction/home",
    "Post Templates": "https://jstart.lightning.force.com/lightning/setup/FeedTemplates/home",
    "Process Automation Settings": "https://jstart.lightning.force.com/lightning/setup/WorkflowSettings/home",
    "Process Builder": "https://jstart.lightning.force.com/lightning/setup/ProcessAutomation/home",
    "Email Alerts": "https://jstart.lightning.force.com/lightning/setup/WorkflowEmails/home",
    "Field Updates": "https://jstart.lightning.force.com/lightning/setup/WorkflowFieldUpdates/home",
    "Outbound Messages": "https://jstart.lightning.force.com/lightning/setup/WorkflowOutboundMessaging/home",
    "Send Actions": "https://jstart.lightning.force.com/lightning/setup/SendAction/home",
    "Tasks": "https://jstart.lightning.force.com/lightning/setup/WorkflowTasks/home",
    "Workflow Rules": "https://jstart.lightning.force.com/lightning/setup/WorkflowRules/home",
    "Action Link Templates": "https://jstart.lightning.force.com/lightning/setup/ActionLinkGroupTemplates/home",
    "App Menu": "https://jstart.lightning.force.com/lightning/setup/AppMenu/home",
    "Custom Labels": "https://jstart.lightning.force.com/lightning/setup/ExternalStrings/home",
    "Density Settings": "https://jstart.lightning.force.com/lightning/setup/DensitySetup/home",
    "Global Actions": "https://jstart.lightning.force.com/lightning/setup/GlobalActions/home",
    "Publisher Layouts": "https://jstart.lightning.force.com/lightning/setup/GlobalPublisherLayouts/home",
    "Guided Actions": "https://jstart.lightning.force.com/lightning/setup/GuidedActions/home",
    "Lightning App Builder": "https://jstart.lightning.force.com/lightning/setup/FlexiPageList/home",
    "Path Settings": "https://jstart.lightning.force.com/lightning/setup/PathAssistantSetupHome/home",
    "Quick Text Settings": "https://jstart.lightning.force.com/lightning/setup/LightningQuickTextSettings/home",
    "Rename Tabs and Labels": "https://jstart.lightning.force.com/lightning/setup/RenameTab/home",
    "Custom URLs": "https://jstart.lightning.force.com/lightning/setup/DomainSites/home",
    "Domains": "https://jstart.lightning.force.com/lightning/setup/DomainNames/home",
    "Sites": "https://jstart.lightning.force.com/lightning/setup/CustomDomain/home",
    "Tabs": "https://jstart.lightning.force.com/lightning/setup/CustomTabs/home",
    "Themes and Branding": "https://jstart.lightning.force.com/lightning/setup/ThemingAndBranding/home",
    "Export": "https://jstart.lightning.force.com/lightning/setup/LabelWorkbenchExport/home",
    "Import": "https://jstart.lightning.force.com/lightning/setup/LabelWorkbenchImport/home",
    "Override": "https://jstart.lightning.force.com/lightning/setup/LabelWorkbenchOverride/home",
    "Translate": "https://jstart.lightning.force.com/lightning/setup/LabelWorkbenchTranslate/home",
    "Translation Settings": "https://jstart.lightning.force.com/lightning/setup/LabelWorkbenchSetup/home",
    "User Interface": "https://jstart.lightning.force.com/lightning/setup/UserInterfaceUI/home",
    "Apex Classes": "https://jstart.lightning.force.com/lightning/setup/ApexClasses/home",
    "Apex Hammer Test Results": "https://jstart.lightning.force.com/lightning/setup/ApexHammerResultStatus/home",
    "Apex Settings": "https://jstart.lightning.force.com/lightning/setup/ApexSettings/home",
    "Apex Test Execution": "https://jstart.lightning.force.com/lightning/setup/ApexTestQueue/home",
    "Apex Test History": "https://jstart.lightning.force.com/lightning/setup/ApexTestHistory/home",
    "Apex Triggers": "https://jstart.lightning.force.com/lightning/setup/ApexTriggers/home",
    "Canvas App Previewer": "https://jstart.lightning.force.com/lightning/setup/CanvasPreviewerUi/home",
    "Custom Metadata Types": "https://jstart.lightning.force.com/lightning/setup/CustomMetadata/home",
    "Custom Permissions": "https://jstart.lightning.force.com/lightning/setup/CustomPermissions/home",
    "Custom Settings": "https://jstart.lightning.force.com/lightning/setup/CustomSettings/home",
    "Email Services": "https://jstart.lightning.force.com/lightning/setup/EmailToApexFunction/home",
    "Debug Mode": "https://jstart.lightning.force.com/lightning/setup/UserDebugModeSetup/home",
    "Lightning Components": "https://jstart.lightning.force.com/lightning/setup/LightningComponentBundles/home",
    "Platform Cache": "https://jstart.lightning.force.com/lightning/setup/PlatformCache/home",
    "Remote Access": "https://jstart.lightning.force.com/lightning/setup/RemoteAccess/home",
    "Static Resources": "https://jstart.lightning.force.com/lightning/setup/StaticResources/home",
    "Tools": "https://jstart.lightning.force.com/lightning/setup/ClientDevTools/home",
    "Visualforce Components": "https://jstart.lightning.force.com/lightning/setup/ApexComponents/home",
    "Visualforce Pages": "https://jstart.lightning.force.com/lightning/setup/ApexPages/home",
    "Dev Hub": "https://jstart.lightning.force.com/lightning/setup/DevHub/home",
    "Inbound Change Sets": "https://jstart.lightning.force.com/lightning/setup/InboundChangeSet/home",
    "Outbound Change Sets": "https://jstart.lightning.force.com/lightning/setup/OutboundChangeSet/home",
    "Deployment Settings": "https://jstart.lightning.force.com/lightning/setup/DeploymentSettings/home",
    "Deployment Status": "https://jstart.lightning.force.com/lightning/setup/DeployStatus/home",
    "Apex Flex Queue": "https://jstart.lightning.force.com/lightning/setup/ApexFlexQueue/home",
    "Apex Jobs": "https://jstart.lightning.force.com/lightning/setup/AsyncApexJobs/home",
    "Background Jobs": "https://jstart.lightning.force.com/lightning/setup/ParallelJobsStatus/home",
    "Bulk Data Load Jobs": "https://jstart.lightning.force.com/lightning/setup/AsyncApiJobStatus/home",
    "Scheduled Jobs": "https://jstart.lightning.force.com/lightning/setup/ScheduledJobs/home",
    "Debug Logs": "https://jstart.lightning.force.com/lightning/setup/ApexDebugLogs/home",
    "Email Log Files": "https://jstart.lightning.force.com/lightning/setup/EmailLogFiles/home",
    "API Usage Notifications": "https://jstart.lightning.force.com/lightning/setup/MonitoringRateLimitingNotification/home",
    "Case Escalations": "https://jstart.lightning.force.com/lightning/setup/DataManagementManageCaseEscalation/home",
    "Email Snapshots": "https://jstart.lightning.force.com/lightning/setup/EmailCapture/home",
    "Outbound Messages": "https://jstart.lightning.force.com/lightning/setup/WorkflowOmStatus/home",
    "Time-Based Workflow": "https://jstart.lightning.force.com/lightning/setup/DataManagementManageWorkflowQueue/home",
    "Sandboxes": "https://jstart.lightning.force.com/lightning/setup/DataManagementCreateTestInstance/home",
    "System Overview": "https://jstart.lightning.force.com/lightning/setup/SystemOverview/home",
    "Adoption Assistance": "https://jstart.lightning.force.com/lightning/setup/AdoptionAssistance/home",
    "Help Menu": "https://jstart.lightning.force.com/lightning/setup/HelpMenu/home",
    "API": "https://jstart.lightning.force.com/lightning/setup/WebServices/home",
    "Change Data Capture": "https://jstart.lightning.force.com/lightning/setup/CdcObjectEnablement/home",
    "Data Import Wizard": "https://jstart.lightning.force.com/lightning/setup/DataManagementDataImporter/home",
    "Data Loader": "https://jstart.lightning.force.com/lightning/setup/DataLoader/home",
    "Dataloader.io": "https://jstart.lightning.force.com/lightning/setup/DataLoaderIo/home",
    "External Data Sources": "https://jstart.lightning.force.com/lightning/setup/ExternalDataSource/home",
    "External Objects": "https://jstart.lightning.force.com/lightning/setup/ExternalObjects/home",
    "External Services": "https://jstart.lightning.force.com/lightning/setup/ExternalServices/home",
    "Platform Events": "https://jstart.lightning.force.com/lightning/setup/EventObjects/home",
    "Business Hours": "https://jstart.lightning.force.com/lightning/setup/BusinessHours/home",
    "Public Calendars and Resources": "https://jstart.lightning.force.com/lightning/setup/Calendars/home",
    "Company Information": "https://jstart.lightning.force.com/lightning/setup/CompanyProfileInfo/home",
    "Critical Updates": "https://jstart.lightning.force.com/lightning/setup/CriticalUpdates/home",
    "Data Protection and Privacy": "https://jstart.lightning.force.com/lightning/setup/ConsentManagement/home",
    "Fiscal Year": "https://jstart.lightning.force.com/lightning/setup/ForecastFiscalYear/home",
    "Holidays": "https://jstart.lightning.force.com/lightning/setup/Holiday/home",
    "Language Settings": "https://jstart.lightning.force.com/lightning/setup/LanguageSettings/home",
    "Maps and Location Settings": "https://jstart.lightning.force.com/lightning/setup/MapsAndLocationServicesSettings/home",
    "My Domain": "https://jstart.lightning.force.com/lightning/setup/OrgDomain/home",
    "Data Classification (Beta)": "https://jstart.lightning.force.com/lightning/setup/DataClassificationSettings/home",
    "Data Classification Download": "https://jstart.lightning.force.com/lightning/setup/DataClassificationDownload/home",
    "Data Classification Upload": "https://jstart.lightning.force.com/lightning/setup/DataClassificationUpload/home",
    "Auth. Providers": "https://jstart.lightning.force.com/lightning/setup/AuthProviders/home",
    "Identity Provider": "https://jstart.lightning.force.com/lightning/setup/IdpPage/home",
    "Identity Provider Event Log": "https://jstart.lightning.force.com/lightning/setup/IdpErrorLog/home",
    "Identity Verification": "https://jstart.lightning.force.com/lightning/setup/IdentityVerification/home",
    "Identity Verification History": "https://jstart.lightning.force.com/lightning/setup/VerificationHistory/home",
    "Login Flows": "https://jstart.lightning.force.com/lightning/setup/LoginFlow/home",
    "Login History": "https://jstart.lightning.force.com/lightning/setup/OrgLoginHistory/home",
    "Single Sign-On Settings": "https://jstart.lightning.force.com/lightning/setup/SingleSignOn/home",
    "Activations": "https://jstart.lightning.force.com/lightning/setup/ActivatedIpAddressAndClientBrowsersPage/home",
    "CORS": "https://jstart.lightning.force.com/lightning/setup/CorsWhitelistEntries/home",
    "CSP Trusted Sites": "https://jstart.lightning.force.com/lightning/setup/SecurityCspTrustedSite/home",
    "Certificate and Key Management": "https://jstart.lightning.force.com/lightning/setup/CertificatesAndKeysManagement/home",
    "Delegated Administration": "https://jstart.lightning.force.com/lightning/setup/DelegateGroups/home",
    "Event Monitoring Settings": "https://jstart.lightning.force.com/lightning/setup/EventMonitoringSetup/home",
    "Expire All Passwords": "https://jstart.lightning.force.com/lightning/setup/SecurityExpirePasswords/home",
    "Field Accessibility": "https://jstart.lightning.force.com/lightning/setup/FieldAccessibility/home",
    "File Upload and Download Security": "https://jstart.lightning.force.com/lightning/setup/FileTypeSetting/home",
    "Health Check": "https://jstart.lightning.force.com/lightning/setup/HealthCheck/home",
    "Login Access Policies": "https://jstart.lightning.force.com/lightning/setup/LoginAccessPolicies/home",
    "Named Credentials": "https://jstart.lightning.force.com/lightning/setup/NamedCredential/home",
    "Network Access": "https://jstart.lightning.force.com/lightning/setup/NetworkAccess/home",
    "Password Policies": "https://jstart.lightning.force.com/lightning/setup/SecurityPolicies/home",
    "Remote Site Settings": "https://jstart.lightning.force.com/lightning/setup/SecurityRemoteProxy/home",
    "Session Management": "https://jstart.lightning.force.com/lightning/setup/SessionManagementPage/home",
    "Session Settings": "https://jstart.lightning.force.com/lightning/setup/SecuritySession/home",
    "Sharing Settings": "https://jstart.lightning.force.com/lightning/setup/SecuritySharing/home",
    "View Setup Audit Trail": "https://jstart.lightning.force.com/lightning/setup/SecurityEvents/home",
    "Optimizer": "https://jstart.lightning.force.com/lightning/setup/SalesforceOptimizer/home"
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

  var mouseClickLoginAsUserId;
  var mouseClickLoginAs=
    function(){
      loginAsPerform(mouseClickLoginAsUserId);
      return true;
    }

  function getSingleObjectMetadata()
  {
    var recordId = document.URL.split('/')[3];
    var keyPrefix = recordId.substring(0,3);

  }
  function addElements(ins) {
    if(ins.substring(0,9) == 'login as ') {
      if(serverInstance.includes('lightning.force')) return;
      clearOutput();
      addWord('Usage: login as <FirstName> <LastName> OR <Username>');
      setVisible('visible');
    }
    else if(ins.substring(0,3) == 'cf ' && ins.split(' ').length < 4) {
      if(serverInstance.includes('lightning.force')) return;
      clearOutput();
      addWord('Usage: cf <Object API Name> <Field Name> <Data Type>');
      setVisible('visible');
    }
    else if(ins.substring(0,3) == 'cf ' && ins.split(' ').length == 4) {
      if(serverInstance.includes('lightning.force')) return;
      clearOutput();
      var wordArray = ins.split(' ');
      words = getWord(wordArray[3], META_DATATYPES);
      var words2 = [];
      for(var i = 0; i<words.length; i++) {
        switch(words[i].toUpperCase()) {
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
    else if(ins.substring(0,3) == 'cf ' && ins.split(' ').length > 4) {
      clearOutput();
    }
    else {
      words = getWord(ins, cmds);

      if (words.length > 0){
        clearOutput();
        for (var i=0;i<words.length; ++i) addWord (words[i]);
        setVisible("visible");
        input = document.getElementById("sfnav_quickSearch").value;
      }
      else{
        clearOutput();
        setVisible("hidden");
        posi = -1;
      }
    }
    var firstEl = document.querySelector('#sfnav_output :first-child');

    if(posi == -1 && firstEl != null) firstEl.className = "sfnav_child sfnav_selected"
  }

  function httpGet(url, callback) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("Authorization", sid.trim());
    req.onload = function(response) {
      callback(response);
    }
    req.send();
  }
  function getVisible(){
    return document.getElementById("sfnav_shadow").style.visibility;
  }
  function isVisible() {
    return document.getElementById("sfnav_shadow").style.visibility !== 'hidden';
  }
  function setVisible(visi){
    var x = document.getElementById("sfnav_shadow");
    x.style.position = 'relative';
    x.style.visibility = visi;
  }
  function isVisibleSearch() {
    return document.getElementById("sfnav_quickSearch").style.visibility !== 'hidden';
  }
  function setVisibleSearch(visi)
  {
    var t = document.getElementById("sfnav_search_box");
    t.style.visibility = visi;
    if(visi=='visible') document.getElementById("sfnav_quickSearch").focus();
  }

  function lookAt(){
    let newSearchVal = document.getElementById('sfnav_quickSearch').value
    if (newSearchVal !== '') {
      addElements(newSearchVal);
    }
    else{
      document.querySelector('#sfnav_output').innerHTML = '';
      setVisible("hidden");
      posi = -1;
    }
  }
  function addWord(word){
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
  function getWord(beginning, dict) {
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
                    sortValue = 1;
                  }
                else
                  {
                    match = false;
                    if(dict[key]['synonyms'] !== undefined){
                      for(var j = 0;j<dict[key]['synonyms'].length;j++){
                        keySynonym = dict[key]['synonyms'][j];
                        if(keySynonym.toLowerCase().indexOf(tmpSplit[i].toLowerCase()) != -1)
                          {
                            match = true;
                            sortValue = 0.5;
                          }
                      }
                    }
                  }

                if (!match)
                  {
                    break;
                  }
              }
            if(match) arrFound.push({num : sortValue, key : key});
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

  function invokeCommand(cmd, newtab, event) {
    if(cmds[cmd] == undefined) {console.log(cmd + " not found in command list"); return}
    let theurl = cmds[cmd].url
    // if(serverInstance.includes("lightning.force")) {
    //   //https://jstart.my.salesforce.com/p/setup/layout/LayoutFieldList?type=Contact&setupid=ContactFields&retURL=%2Fui%2Fsetup%2FSetup%3Fsetupid%3DContact
    //   // https://jstart.lightning.force.com/lightning/setup/ObjectManager/Case/FieldsAndRelationships/view
    //   let link = cmd.split(">").map(function (L) {return L.trim()})
    //   let ltngObject = link[ link.length - 2 ].replace(/\s/g, "")
    //   let ltngTarget = link[ link.length - 1 ]
    //   if(Object.keys(classicToLightingMap).includes(link[ link.length - 1 ]))
    //     ltngTarget = classicToLightingMap[ link[ link.length - 1 ]]
    //   theurl = serverInstance + '/lightning/setup/ObjectManager/' + ltngObject + '/' + ltngTarget.replace(/\s/g, "") + '/view'
    // }
    if(event != 'click' && typeof cmds[cmd] != 'undefined' && (cmds[cmd].url != null || cmds[cmd].url == '')) {
      if(newtab) {
        var w = window.open(theurl, '_newtab')
        w.blur()
        window.focus()
      } else {
        window.location.href = theurl
     }
     return true;
   }
   if(cmd.toLowerCase() == 'toggle detailed mode') {
    var req = {}
    req.action = 'Toggle Detailed Mode'
    req.key = getCmdHash()
    chrome.runtime.sendMessage(req, function(response) {
      getAllObjectMetadata()
      window.location.reload()
    })
    return true
   }
   if(cmd.toLowerCase() == 'refresh metadata') {
    showLoadingIndicator()
    var req = {}
    req.action = 'Clear Commands'
    req.key = getCmdHash()
    chrome.runtime.sendMessage(req, function(response) {})

    getAllObjectMetadata()
    setTimeout(function() {
      hideLoadingIndicator()
    }, 30000)
    return true
  }
  if(cmd.toLowerCase() == 'setup') {
    window.location.href = serverInstance + '/ui/setup/Setup';
    return true;
  }
  if(cmd.toLowerCase().substring(0,3) == 'cf ') {
    createField(cmd);
    return true;
  }
  if(cmd.toLowerCase().substring(0,9) == 'login as ')
  {
    loginAs(cmd);
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
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'CHECKBOX':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'CURRENCY':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
          break;
          case 'DATE':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'DATETIME':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'EMAIL':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'FORMULA':

          break;
          case 'GEOLOCATION':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null, arrSplit[4],null,null,null);
          break;
          case 'HIERARCHICALRELATIONSHIP':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
          break;
          case 'LOOKUP':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
          break;
          case 'MASTERDETAIL':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,arrSplit[4],null);
          break;
          case 'NUMBER':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
          break;
          case 'PERCENT':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, leftDecimals, rightDecimals,null,null,null);
          break;
          case 'PHONE':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'PICKLIST':
          var plVal = [];
          plVal.push(new forceTooling.CustomFields.PicklistValue('CHANGEME'));
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,plVal,null,null);
          break;
          case 'PICKLISTMS':
          var plVal = [];
          plVal.push(new forceTooling.CustomFields.PicklistValue('CHANGEME'));
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,plVal,null,null);
          break;
          case 'ROLLUPSUMMARY':

          break;
          case 'TEXT':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,null);
          break;
          case 'TEXTENCRYPTED':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;
          case 'TEXTAREA':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,null);
          break;
          case 'TEXTAREALONG':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,arrSplit[4]);
          break;
          case 'TEXTAREARICH':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, typeLength, null,null,null,null,arrSplit[4]);
          break;
          case 'URL':
          fieldMeta = new  forceTooling.CustomFields.CustomField(sObjectName, sObjectId, fieldName, dataType, null, null, null,null,null,null,null);
          break;

        }

        ftClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, serverInstance + '');
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

  function loginAs(cmd) {
    var arrSplit = cmd.split(' ');
    var searchValue = arrSplit[2];
    if(arrSplit[3] !== undefined)
      searchValue += '+' + arrSplit[3];

    var query = 'SELECT+Id,+Name,+Username+FROM+User+WHERE+Name+LIKE+\'%25' + searchValue + '%25\'+OR+Username+LIKE+\'%25' + searchValue + '%25\'';
    console.log(query);

    ftClient.query(query,
      function(success) {
        console.log(success);
        var numberOfUserRecords = success.records.length;
        if(numberOfUserRecords < 1){
          addError([{"message":"No user for your search exists."}]);
        } else if(numberOfUserRecords > 1){
          loginAsShowOptions(success.records);
        } else {
          var userId = success.records[0].Id;
          loginAsPerform(userId);
        }
      },
      function(error)
      {
        console.log(error);
        addError(error.responseJSON);
      }
    );
  }

  function loginAsShowOptions(records) {
    if(!serverInstance.includes("lightning.force")) {
      for(var i = 0; i < records.length; ++i) {
        var cmd = 'Login As ' + records[i].Name
        cmds[cmd] = {key: cmd, id: records[i].Id}
        addWord(cmd)
      }
      setVisible('visible')
    }
  }

  function loginAsPerform(userId) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
        document.write(xmlhttp.responseText );
        document.close();
        setTimeout(function() {
          document.getElementsByName("login")[0].click();
        }, 1000);
      }
    }
    xmlhttp.open("GET", userDetailPage(userId), true);
    xmlhttp.send();
  }

  function userDetailPage(userId) {
    var loginLocation = window.location.protocol + '//' + window.location.host + '/' + userId + '?noredirect=1';
    console.log(loginLocation);
    return loginLocation;
  }

  function getMetadata(_data) {
    if(_data.length == 0) return;
    var metadata = JSON.parse(_data);
    var mRecord = {};
    var act = {};
    metaData = {};
    metadata.sobjects.map( obj => {

      if(obj.keyPrefix != null) {
        mRecord = {label, labelPlural, keyPrefix, urls} = obj;
        metaData[obj.keyPrefix] = mRecord;

        act = {
          key: obj.name,
          keyPrefix: obj.keyPrefix,
          url: serverInstance + '/' + obj.keyPrefix
        }
        cmds['List ' + mRecord.labelPlural] = act;
        cmds['List ' + mRecord.labelPlural]['synonyms'] = [obj.name];

        act = {
          key: obj.name,
          keyPrefix: obj.keyPrefix,
          url: serverInstance + '/' + obj.keyPrefix + '/e',
        }
        cmds['New ' + mRecord.label] = act;
        cmds['New ' + mRecord.label]['synonyms'] = [obj.name];

      }
    })

    store('Store Commands', cmds);
  }

  function store(action, payload) {
    var req = {}
    req.action = action;
    req.key = getCmdHash();
    req.payload = payload;

    chrome.runtime.sendMessage(req, function(response) {});
  }

  function getAllObjectMetadata() {
    // session ID is different and useless in VF and in Lightning
    if(location.origin.indexOf("visual.force") !== -1) return;
    serverInstance = getServerInstance()

    cmds['Refresh Metadata'] = {};
    cmds['Toggle Detailed Mode'] = {};
    cmds['Setup'] = {};
    getSetupTree()
    if(serverInstance.includes("lightning.force"))
      getCustomObjects()
    else {
      sid = "Bearer " + getCookie('sid');
      var theurl = getServerInstance() + '/services/data/' + SFAPI_VERSION + '/sobjects/';
      var req = new XMLHttpRequest();
      req.open("GET", theurl, true);
      req.setRequestHeader("Authorization", sid.trim());
      req.setRequestHeader("Accept", "application/json");
      req.onload = function(response) {
        getMetadata(response.target.responseText);
      }
      req.send()
      getCustomObjectsDef()
    }
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
        theurl = setupLabelsToLightningMap[item.innerText]
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
    $(html).find('th a').each(function(el) {
      if(serverInstance.includes("lightning.force")) {
// HERE
// objectId is the customObject record, need to find how to get the keyPrefix to make it work
//        cmds['List ' + this.text ] = {url: serverInstance + "/" + objectId.substr(0,3), key: "List " + this.text};
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
    var req = new XMLHttpRequest();
    req.onload = function() {
      parseSetupTree(this.response);
      hideLoadingIndicator();
    }
    req.open("GET", theurl);
    req.responseType = 'document';

    req.send();
  }

  function getCustomObjects()
  {
    var theurl = serverInstance + '/p/setup/custent/CustomObjectsPage';
    var req = new XMLHttpRequest();
    req.onload = function() {
      parseCustomObjectTree(this.response);
    }
    req.open("GET", theurl);
    req.responseType = 'document';

    req.send();
  }


  function getCookie(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++) {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x==c_name) {
          return unescape(y);
        }
    }
  }
  function getServerInstance() {
    var url = location.origin + "";
    var urlParseArray = url.split(".");
    var i;
    var returnUrl;

/* why even? */
    if(url.indexOf("lightning.force") != -1) {
      returnUrl = url.substring(0, url.indexOf("lightning.force")) + "lightning.force.com";
      return returnUrl;
    }
    else if(url.indexOf("salesforce") != -1) {
      returnUrl = url.substring(0, url.indexOf("salesforce")) + "salesforce.com";
      return returnUrl;
    }
    else if(url.indexOf("cloudforce") != -1) {
      returnUrl = url.substring(0, url.indexOf("cloudforce")) + "cloudforce.com";
      return returnUrl;
    }
// */
    else if(url.indexOf("visual.force") != -1) {
      returnUrl = 'https://' + urlParseArray[1] + '';
      return returnUrl;
    }
    // return url
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
    var position = posi;
    var origText = '', newText = '';
    if(position <0) position = 0;

    origText = document.getElementById("sfnav_quickSearch").value;
    if(typeof outp.childNodes[position] != 'undefined')
      {
        newText = outp.childNodes[position].firstChild.nodeValue;

      }

    var newtab = newTabKeys.indexOf(key) >= 0 ? true : false;
    if(!newtab){
      clearOutput();
      setVisible("hidden");
    }

    if(!invokeCommand(newText, newtab))
      invokeCommand(origText, newtab);
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
    let searchBar = document.getElementById('sfnav_quickSearch');

    Mousetrap.bindGlobal(shortcut, function(e) {
      setVisibleSearch("visible");
      return false;
    });

    Mousetrap.bindGlobal('esc', function(e) {

      if (isVisible() || isVisibleSearch()) {

        searchBar.blur();
        clearOutput();
        searchBar.value = '';

        setVisible("hidden");
        setVisibleSearch("hidden");

      }

    });

    Mousetrap.wrap(searchBar).bind('enter', kbdCommand);

    for (var i = 0; i < newTabKeys.length; i++) {
      Mousetrap.wrap(searchBar).bind(newTabKeys[i], kbdCommand);
    };

    Mousetrap.wrap(searchBar).bind('down', selectMove.bind(this, 'down'));

    Mousetrap.wrap(searchBar).bind('up', selectMove.bind(this, 'up'));


    Mousetrap.wrap(document.getElementById('sfnav_quickSearch')).bind('backspace', function(e) {
      posi = -1;
      oldins=-1;
    });

    document.getElementById('sfnav_quickSearch').oninput = function(e) {
      lookAt();
      return true;
    }

  }

  function showLoadingIndicator() {
    document.getElementById('sfnav_loader').style.visibility = 'visible';
  }
  function hideLoadingIndicator() {
    document.getElementById('sfnav_loader').style.visibility = 'hidden';
  }
  function getCustomObjectsDef() {
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

  function getCmdHash() {
    omnomnom = getCookie('sid')
    clientId = omnomnom.split('!')[0]
    hash = clientId + '!' + omnomnom.substring(omnomnom.length - 10, omnomnom.length)
    return hash
  }

  function init() {
    ftClient = new forceTooling.Client();
    ftClient.setSessionToken(getCookie('sid'), SFAPI_VERSION, serverInstance + '');

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
    outp = document.getElementById("sfnav_output");
    hideLoadingIndicator();
    initSettings();
    hash = getCmdHash()

    chrome.runtime.sendMessage({
      action:'Get Commands', 'key': hash},
      function(response) {
        cmds = response;
        if(cmds == null || cmds.length == 0) {
          cmds = {}
          metaData = {}
          getAllObjectMetadata()
        }
    })
  }


  if(serverInstance == null || getCookie('sid') == null || getCookie('sid').split('!').length != 2) {
    console.log('error', serverInstance, getCookie('sid'))
    return
  }
  else init();

})();
