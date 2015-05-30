$(function() {
	$('#loginSubmit').click(function() {

		API.call( API.ACTION_LOGIN, {
			u: $('#loginUsername').val(),
			p: $('#loginPassword').val()
		}, function() {
			
		});

	});
});