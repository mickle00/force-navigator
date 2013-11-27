var sfmdapi = window.sfmdapi;

if (sfmdapi === undefined) {
  sfmdapi = {};
}

if (sfmdapi.Client === undefined) {  
  	sfmdapi.Client = function(sessionId, instanceUrl, apiVersion) {
		this.sessionId = sessionId;
		this.instanceUrl = instanceUrl;
		this.apiVersion = apiVersion;
	};
}


sfmdapi.Client.prototype.listMetadata = function(folder, type, success, error) {

	var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" \
	xmlns:met="http://soap.sforce.com/2006/04/metadata">\
   <soapenv:Header>\
      <met:CallOptions>\
         <met:client></met:client>\
      </met:CallOptions>\
      <met:SessionHeader>\
         <met:sessionId>' + this.sessionId + '</met:sessionId>\
      </met:SessionHeader>\
   </soapenv:Header>\
   <soapenv:Body>\
      <met:listMetadata>\
         <met:queries>\
            <met:folder>' + folder + '</met:folder>\
             <met:type>' + type + '</met:type>\
         </met:queries>\
         <met:asOfVersion>' + this.apiVersion + '</met:asOfVersion>\
      </met:listMetadata>\
   </soapenv:Body>\
</soapenv:Envelope>';


	$.ajax({
		type: 'POST',
		url: this.instanceUrl + '/services/Soap/m/' + this.apiVersion,
		data: body,
		beforeSend: function(xhr) {
          xhr.setRequestHeader('SOAPAction', '""');
      	},
		contentType:'text/xml;charset=UTF-8',
		success: success,
      	error: error,
	});
}

sfmdapi.Client.prototype.updatePermissions = function(fieldName, profiles, readable, editable, success, error) {
	var body = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:met="http://soap.sforce.com/2006/04/metadata">\
   <soapenv:Header>\
      <met:CallOptions>\
         <met:client></met:client>\
      </met:CallOptions>\
      <met:SessionHeader>\
         <met:sessionId>' + this.sessionId + '</met:sessionId>\
      </met:SessionHeader>\
   </soapenv:Header>\
   <soapenv:Body>\
      <met:update>';
            for (var i = 0; i < profiles.length; i++) {
            	body +=	          
            '<met:UpdateMetadata>\
            	<met:metadata xsi:type="ns2:Profile" xmlns:ns2="http://soap.sforce.com/2006/04/metadata">\
                <met:fullName>' + profiles[i] + '</met:fullName>\
               	<met:fieldLevelSecurities>\
               	<met:field>' + fieldName + '</met:field>\
               	<met:readable>' + readable + '</met:readable>\
               	<met:editable>' + editable + '</met:editable>\
               	</met:fieldLevelSecurities>\
               	<met:fieldPermissions>\
               	<met:field>' + fieldName + '</met:field>\
               	<met:readable>' + readable + '</met:readable>\
               	<met:editable>' + editable + '</met:editable>\
               </met:fieldPermissions>\
               </met:metadata>\
               </met:UpdateMetadata>';
            };

            body += '</met:update>\
  			 </soapenv:Body>\
				</soapenv:Envelope>';
				console.log(body);
	$.ajax({
		type: 'POST',
		url: this.instanceUrl + '/services/Soap/m/' + this.apiVersion,
		data: body,
		beforeSend: function(xhr) {
          xhr.setRequestHeader('SOAPAction', '""');
      	},
		contentType:'text/xml;charset=UTF-8',
		success: success,
      	error: error,
	});


}
var cl = new sfmdapi.Client('00DE0000000JBPP!AR4AQFNaMXmGdBfRK85aXlJK7pR7FJ9vuhrSIHndrgg6he9NDeOxz8bi39MKAuy_8KOgcDRpW0PGDs.we_MRLkRqbjpfbSj0', 'https://na9.salesforce.com', '29.0');
cl.listMetadata('*', 'Profile', function(s) {
	var arr = [];
	$(s).find('fullName').each(function() {
		arr.push(this.innerHTML);
	});
	cl.updatePermissions('Account.test12__c', arr, 'true', 'true');
}, function(e) {

});
