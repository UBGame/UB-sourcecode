var API = {
	settings : {
		"api_url": "http://ultimatebusiness.mariandev.eu/api"
	},

	ACTION_LOGIN: 'user_login'

};

API.error = function(e) {

	var err = $.parseJSON(e.responseText);

	console.error( "API-ERROR[" + err.n + "]: " + LANG[ err.n ] + ( err.m ? " ( " + err.m + " )": "" ));

};

API.call = function(a, d, cb) {

	d["api_call_action"] = a;

	$.ajax({
		url: API.settings.api_url,
		data: d,
		success: cb || function(){return;},
		error: API.error
	});
};