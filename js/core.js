$(function() {

	API.user_is_logged_in(function(d) {
		if(!d.logged_in)
			API.redirect(API.settings.base_url);
	});

	CORE.game.init();

	/*if ($('[data-toggle="select"]').length) {
      $('[data-toggle="select"]').select2();
    }*/

});

var CORE = {

	user: {},
	company: {},
	game: {
		cycle: {}
	},
	ui: {
		modals: {}
	}

};

/*======SETTINGS======*/

CORE.settings = {
	cycle: {
		interval: 500
	}
};

/*========GAME========*/

CORE.game.init = function() {

	//get user info
	//populate ui
	//generate map
	//get markers
	//populate map with markers
	//get links
	//populate map with links

	API.user.getInfo(function(d) {
		CORE.user.info = d;

		$('#navbar_user_dropbox_name').text( ( d.firstname && d.lastname ? d.firstname + ' ' + d.lastname : d.username ) );

		API.company.getInfo(d.id_active_company, function(d) {
			$('#navbar_company_dropdown_name').text(d.name);

			$('#navbar_company_dropdown_finances').click(function() {
				CORE.ui.modals.create('finances');
			});

		});

	});

	CORE.game.cycle.start(CORE.settings.cycle.interval);

};

/*=======CYCLE========*/

CORE.game.cycle.storage = {};
CORE.game.cycle.subscribe = function(name, fn) {
	CORE.game.cycle.storage[name] = fn;
};
CORE.game.cycle.unsubscribe = function(name) {
	if(CORE.game.cycle.storage[name])
		delete CORE.game.cycle.storage[name];
};
CORE.game.cycle.start = function(interval) {
	CORE.game.cycle.interval = setInterval(CORE.game.cycle.run, interval);
};
CORE.game.cycle.end = function() {
	clearInterval(CORE.game.cycle.interval);
};
CORE.game.cycle.run = function() {
	for(fn in CORE.game.cycle.storage)
		CORE.game.cycle.storage[fn]();
};


/*=========UI=========*/

/*=======MODALS=======*/

CORE.ui.modals.storage = [];
CORE.ui.modals.presets = {
	'test': {
		code: {
			title: 'Test modal',
			body: '<h4>MODAL</h4>',
			footer: '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
		},
		runtime: function(modal) {
			alert("Hallo o/");
			return modal;
		},
		cycle: function(modal_id) {
			console.log('Hallo again \\o/ ( ' + modal_id + ' )');
		}
	},
	'finances': {
		code: {
			title: 'Finances',
			body: 'Money: <span id="MODAL_ID_money">0</span>',
			footer: ''
		},
		cycle: function(id) {
			$("#" + id + '_money').text( parseInt($("#" + id + '_money').text()) + Math.floor(Math.random() * 1000) );
		}
	}
};
CORE.ui.modals.create = function(type) {
	var id = "modal_" + Math.floor( Math.random() * 100000 );
	var modal = "<div id=\"MODAL_ID\" class=\"modal fade ui-draggable in\" aria-hidden=\"false\" style=\"display: block;\">"
			  + "<div class=\"modal-dialog\">"
			  + "<div class=\"modal-content\">"
			  + "<div class=\"modal-header\" id=\"MODAL_ID_header\">"
			  + "<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&#215;</button>"
			  + "<h4 class=\"modal-title\">"
			  + CORE.ui.modals.presets[type].code.title
			  + "</h4>"
			  + "</div>"
			  + "<div class=\"modal-body\">"
			  + CORE.ui.modals.presets[type].code.body
			  + "</div>"
			  + "<div class=\"modal-footer\">"
			  + CORE.ui.modals.presets[type].code.footer
			  + "</div>"
			  + "</div>"
			  + "</div>"
			  + "</div>";

	modal = modal.replace(new RegExp('MODAL_ID', 'g'), id);

	if(CORE.ui.modals.presets[type].runtime)
		modal = CORE.ui.modals.presets[type].runtime(modal);

	$(document.body).append(modal);
	$('#'+id).draggable({
	    handle: "#" + id + "_header"
	});

	CORE.ui.modals.storage.push(id);

	if(CORE.ui.modals.presets[type].cycle)
		CORE.game.cycle.subscribe(id, (CORE.ui.modals.presets[type].cycle).bind(null, id));

};
