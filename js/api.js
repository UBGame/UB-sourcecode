var API = {
	settings : {
		"global_prefix": "UB_",
		"base_url": "http://ultimatebusiness.mariandev.eu",
		"api_url":  "http://ultimatebusiness.mariandev.eu/api"
	},

	ACTION_LOGIN: 'user_login',
	ACTION_LOGOUT: 'user_logout',
	ACTION_IS_LOGGED_IN: 'user_is_logged_in',


	ACTION_USER_GET_INFO: 'user_get_info',
	ACTION_USER_GET_COMPANIES: 'user_get_companies',
	ACTION_USER_SET_ACTIVE_COMPANY: 'user_set_active_company',

	ACTION_COMPANY_GET_INFO: 'company_get_info',
	ACTION_COMPANY_CREATE: 'company_create',
	ACTION_COMPANY_GET_IN_BOUNDS: 'company_get_in_bounds',
	ACTION_COMPANY_GET_BRANCHES: 'company_get_branches',

	ACTION_BRANCH_CREATE: 'branch_create'

};

API.getErrorMessage = function(id) {
	return LANG[ id ];
};

API.error = function(e) {

	var err = $.parseJSON(e.responseText);

	console.error( "API-ERROR[" + err.n + "]: " + API.getErrorMessage(err.n) + ( err.m ? " ( " + err.m + " )": "" ));

};

API.call = function(a, d, cb, ed) {
	
	if(!d) var d = {};
	
	d["api_call_action"] = a;

	$.ajax({
		url: API.settings.api_url,
		data: d,
		//success: cb || function(){return;},
		success: $.proxy(function(ed, d) {
			if(d)
				d = $.parseJSON(d);
			cb(d, ed);
		}, this, ed),
		error: API.error
	});
};

API.redirect = function(url) {
	window.location.href = url;
};

API.getCookie = function(name) {
	var value = "; " + document.cookie;
  	var parts = value.split("; " + API.settings.global_prefix + "" + name + "=");
  	if (parts.length == 2) return parts.pop().split(";").shift();
};
