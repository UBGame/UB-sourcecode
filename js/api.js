var API = {
	settings : {
		"global_prefix": "UB_",
		"base_url": "http://ultimatebusiness.mariandev.eu",
		"api_url":  "http://ultimatebusiness.mariandev.eu/api"
	},

	ACTION_LOGIN: 'user_login',
	ACTION_IS_LOGGED_IN: 'user_is_logged_in',
	ACTION_USER_GET_INFO: 'user_get_info',

	ACTION_COMPANY_GET_INFO: 'company_get_info'

};

API.error = function(e) {

	var err = $.parseJSON(e.responseText);

	console.error( "API-ERROR[" + err.n + "]: " + LANG[ err.n ] + ( err.m ? " ( " + err.m + " )": "" ));

};

API.call = function(a, d, cb) {
	
	if(!d) var d = {};
	
	d["api_call_action"] = a;

	$.ajax({
		url: API.settings.api_url,
		data: d,
		//success: cb || function(){return;},
		success: (function(d) {
			if(d)
				d = $.parseJSON(d);
			cb(d);
		}).bind(this),
		error: API.error
	});
};

API.user_is_logged_in = function (cb) {

	API.call(API.ACTION_IS_LOGGED_IN, null, cb);

};

API.redirect = function(url) {
	window.location.href = url;
};

API.getCookie = function(name) {
	var value = "; " + document.cookie;
  	var parts = value.split("; " + API.settings.global_prefix + "" + name + "=");
  	if (parts.length == 2) return parts.pop().split(";").shift();
};

API.user = {};
API.user.getInfo = function (username, cb) {

	if(!cb && typeof username == 'function') var cb = username;

	var d = {};
	if(typeof username == 'string')
		d.u = username;
	else
		d.utk = API.getCookie('utk');

	API.call(API.ACTION_USER_GET_INFO, d, cb);
};

API.company = {};
API.company.getInfo = function(id, cb) {
	API.call(API.ACTION_COMPANY_GET_INFO, {
		i: id
	}, cb);
};