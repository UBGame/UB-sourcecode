$(function() {
	$('#loginSubmit').click(function() {

		API.call( API.ACTION_LOGIN, {
			u: $('#loginUsername').val(),
			p: $('#loginPassword').val()
		}, function() {
			API.redirect(API.settings.base_url + '/game');
		});

	});
});