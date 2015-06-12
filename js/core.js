/*
	Headers made with http://fsymbols.com/generators/tarty/ 
	Settings: Brighter and Perforated
*/

$(function() {

	CORE.user.is_logged_in(function(d) {
		if(!d.logged_in)
			API.redirect(API.settings.base_url);
	});

	$('[data-toggle="tooltip"]').tooltip();

	CORE.game.init();

	/*if ($('[data-toggle="select"]').length) {
	  $('[data-toggle="select"]').select2();
	}*/

});

/*
░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ █ 　░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ 　
░ █ ─ ─ ─ 　░ █ ─ ─ ░ █ 　░ █ ▄ ▄ ▀ 　░ █ ▀ ▀ ▀ 　
░ █ ▄ ▄ █ 　░ █ ▄ ▄ ▄ █ 　░ █ ─ ░ █ 　░ █ ▄ ▄ ▄ 　

*/

var CORE = {

	user: {},
	company: {},
	game: {
		cycle: {}
	},
	ui: {
		windows: {}
	}

};

/*
░ █ ▀ ▀ ▀ █ 　░ █ ▀ ▀ ▀ 　▀ ▀ █ ▀ ▀ 　▀ ▀ █ ▀ ▀ 　▀ █ ▀ 　░ █ ▄ ─ ░ █ 　░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ █ 　
─ ▀ ▀ ▀ ▄ ▄ 　░ █ ▀ ▀ ▀ 　─ ░ █ ─ ─ 　─ ░ █ ─ ─ 　░ █ ─ 　░ █ ░ █ ░ █ 　░ █ ─ ▄ ▄ 　─ ▀ ▀ ▀ ▄ ▄ 　
░ █ ▄ ▄ ▄ █ 　░ █ ▄ ▄ ▄ 　─ ░ █ ─ ─ 　─ ░ █ ─ ─ 　▄ █ ▄ 　░ █ ─ ─ ▀ █ 　░ █ ▄ ▄ █ 　░ █ ▄ ▄ ▄ █ 　

*/

CORE.settings = {
	cycle: {
		interval: 5000
	},
	ui: {
		windows: {
			v_offset: 53
		},
		map: {
			lazy_data_delta: {
				lat: 0.1,
				lng: 0.1
			}
		}
	}
};

/*
░ █ ▀ ▀ █ 　─ █ ▀ ▀ █ 　░ █ ▀ ▄ ▀ █ 　░ █ ▀ ▀ ▀ 　
░ █ ─ ▄ ▄ 　░ █ ▄ ▄ █ 　░ █ ░ █ ░ █ 　░ █ ▀ ▀ ▀ 　
░ █ ▄ ▄ █ 　░ █ ─ ░ █ 　░ █ ─ ─ ░ █ 　░ █ ▄ ▄ ▄ 　

*/

CORE.game.init = function() {

	//get user info
	//populate ui
	//generate map
	//get markers
	//populate map with markers
	//get links
	//populate map with links

	CORE.win = window;

	CORE.user.getInfo(function(d) {
		CORE.user.info = d;

		$('#navbar_user_dropbox_name').text( ( d.firstname && d.lastname ? d.firstname + ' ' + d.lastname : d.username ) );

		$('#nabvar_user_dropbox_logout').click(function() {
			API.call(API.ACTION_LOGOUT, null, function() {
				API.redirect(API.settings.base_url);
			});
		});

		CORE.ui.map.init(0, 0, function() {
			$('#map_controls_globe').click(function() {
				CORE.ui.map.centerTo(0, 0);
				CORE.ui.map.zoomTo(2);
			});

			google.maps.event.addListener(CORE.ui.map.obj, 'zoom_changed', function() {
				//console.log(d);
				if(CORE.ui.map.obj.getZoom() > 12)
					CORE.ui.map.zoomTo(12);
				if(CORE.ui.map.obj.getZoom() < 2)
					CORE.ui.map.zoomTo(2);

				if(CORE.ui.map.obj.getZoom() >= 10) {

					CORE.ui.map.populate();

					//CORE.ui.map.markers.show_infowindow_all();
				}else {
					//CORE.ui.map.markers.hide_infowindow_all();

					CORE.ui.map.markers.clear_nonvisible();

					CORE.ui.map.markers.delete_all(['other_company']);

				}

			});

			google.maps.event.addListener(CORE.ui.map.obj, 'center_changed', function() {

				//if(!CORE.ui.map.lazy_data) CORE.ui.map.calculate_lazy_data(); 

				CORE.ui.map.populate();

			});

		});

		if(!parseInt(d.id_active_company)) {
			$('#navbar_company_name').text("No active company");
		} else {
			CORE.company.getInfo(d.id_active_company, function(d) {
				CORE.company.set_active_company(d, function(d) {

				});
			}, true);
		}

		$('#navbar_company_finances').click(function() {
			CORE.ui.windows.create('finances');
		});

		$('#navbar_company_name').click(function() {
			CORE.ui.windows.create('user_company_switch');
		});

		$('#navbar_search_company').click(function() {

			$('#navbar_search_company_query').removeClass('has-error');
			$('#navbar_search_company').addClass('btn-default').removeClass('btn-danger');

			API.call(API.ACTION_COMPANY_GET_INFO, {
				n: $('#navbar_search_company_query').val()
			}, function(d) {
				if(d) {
					CORE.ui.map.centerTo(d.lat, d.lng);
					CORE.ui.map.zoomTo(12);
					$('#navbar_search_company_query').val("").blur();
					//CORE.ui.map.markers.show_infowindow_all();
				}else {
					$('#navbar_search_company_query').addClass('has-error');
					$('#navbar_search_company').addClass('btn-danger').removeClass('btn-default');
				}
			})
		});

		$('#navbar_create_company').click(function() {
			CORE.ui.windows.create('company_create', {
				left: 'center',
				top: 'top'
			});
		});
		$('#navbar_create_branch').click(function() {
			CORE.ui.windows.create('branch_create', {
				left: 'center',
				top: 'top'
			});
		});

		$('#navbar_company_overview').click(function() {
			CORE.ui.windows.create('user_company_overview');
		});

	});

	$('#navbar_windows_move_toggle').click(function() {
		CORE.ui.windows.movetoggle();
	});
	$('#navbar_windows_close_all').click(function() {
		CORE.ui.windows.delete_all();
	});

	CORE.game.cycle.start(CORE.settings.cycle.interval);

};

CORE.game.update = function() {
	$('[data-toggle="tooltip"]').tooltip();
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
		CORE.game.cycle.storage[fn](fn);
};


/*
░ █ ─ ░ █ 　▀ █ ▀ 　
░ █ ─ ░ █ 　░ █ ─ 　
─ ▀ ▄ ▄ ▀ 　▄ █ ▄ 　

*/

/*
░ █ ─ ─ ░ █ 　▀ █ ▀ 　░ █ ▄ ─ ░ █ 　░ █ ▀ ▀ ▄ 　░ █ ▀ ▀ ▀ █ 　░ █ ─ ─ ░ █ 　░ █ ▀ ▀ ▀ █ 　
░ █ ░ █ ░ █ 　░ █ ─ 　░ █ ░ █ ░ █ 　░ █ ─ ░ █ 　░ █ ─ ─ ░ █ 　░ █ ░ █ ░ █ 　─ ▀ ▀ ▀ ▄ ▄ 　
░ █ ▄ ▀ ▄ █ 　▄ █ ▄ 　░ █ ─ ─ ▀ █ 　░ █ ▄ ▄ ▀ 　░ █ ▄ ▄ ▄ █ 　░ █ ▄ ▀ ▄ █ 　░ █ ▄ ▄ ▄ █ 　

*/

/*
░ █ ▀ ▀ █ 　░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ 　░ █ ▀ ▀ ▀ █ 　░ █ ▀ ▀ ▀ 　▀ ▀ █ ▀ ▀ 　░ █ ▀ ▀ ▀ █ 　
░ █ ▄ ▄ █ 　░ █ ▄ ▄ ▀ 　░ █ ▀ ▀ ▀ 　─ ▀ ▀ ▀ ▄ ▄ 　░ █ ▀ ▀ ▀ 　─ ░ █ ─ ─ 　─ ▀ ▀ ▀ ▄ ▄ 　
░ █ ─ ─ ─ 　░ █ ─ ░ █ 　░ █ ▄ ▄ ▄ 　░ █ ▄ ▄ ▄ █ 　░ █ ▄ ▄ ▄ 　─ ░ █ ─ ─ 　░ █ ▄ ▄ ▄ █ 　
*/

CORE.ui.windows.storage = [];
CORE.ui.windows.zindex = 0;
CORE.ui.windows.presets = {
	'user_company_overview': {
		code: {
			title: 'Overview',
			body: '<div class="row">'
				 +'<div class="col-xs-12">'
				 +'BRANCHES_LIST'
				 +'</div>'
				 +'</div>'
		},
		init: function(d, cb) {
			API.call(API.ACTION_COMPANY_GET_BRANCHES, {
				i: CORE.user.info.id_active_company
			}, function(d, ed) {
				var l = '';
				ed.d.branches = d;
				for(var i = 0;i<d.length;i++) {
					l += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="WINDOW_ID_branch_' + i + '" href="#">' + d[i]['branch_name'] + '</a><br>'
				}
				ed.d.body = UTILS.replace(ed.d.body, 'BRANCHES_LIST', l);
				ed.cb(ed.d);
			}, {d: d, cb: cb});
		},
		runtime: function(d, cb) {
			
			for(var i=0;i<d.branches.length;i++)
				$('#' + d.id + '_branch_' + i).click($.proxy(function(d) {
					CORE.ui.map.centerTo(d.lat, d.lng);
				}, null, d.branches[i]));

			cb(d);
		},
		close: function(d, cb) {cb(d);}
	},
	'user_company_switch': {
		code: {
			title: 'Switch company',
			body: '<div class="row">'
				 +'<div class="col-xs-12">'
				 +'COMPANIES_LIST'
				 +'</div>'
				 +'</div>'
		},
		init: function(d, cb) {
			API.call(API.ACTION_USER_GET_COMPANIES, {
				i: CORE.user.info.id
			}, function(d, ed) {
				var l = '';
				ed.d.companies = d;
				for(var i = 0;i<d.length;i++) {
					l += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="WINDOW_ID_company_' + i + '" href="#">' + d[i]['branch_name'] + '</a><br>'
				}
				ed.d.body = UTILS.replace(ed.d.body, 'COMPANIES_LIST', l);
				ed.cb(ed.d);
			}, {d: d, cb: cb});
		},
		runtime: function(d, cb) {
			
			for(var i=0;i<d.companies.length;i++)
				$('#' + d.id + '_company_' + i).click($.proxy(function(d) {
					API.call(API.ACTION_USER_SET_ACTIVE_COMPANY, {
						i: d.id_company
					},function(d, ed) {
						CORE.company.set_active_company([ed.c], function() {
							return;
						});
					}, {c: d});
				}, null, d.companies[i]));

			cb(d);
		},
		close: function(d, cb) {cb(d);}
	},
	'company_create': {
		code: {
			title: 'Create company',
			body: '<div class="alert alert-danger hide" role="alert" id="WINDOW_ID_error_box"></div>'
				 +'<div class="input-group" id="WINDOW_ID_input_group">'
				 +'<span class="input-group-btn">'
				 +'<button id="WINDOW_ID_center_marker" class="btn btn-default" type="button" data-toggle="tooltip" data-placement="top" title="Center HQ">'
				 +'<span class="glyphicon glyphicon-screenshot"></span>'
				 +'</button>'
				 +'<button id="WINDOW_ID_go_to_marker" class="btn btn-default" type="button" data-toggle="tooltip" data-placement="top" title="Go to HQ">'
				 +'<span class="glyphicon glyphicon-home"></span>'
				 +'</button>'
				 +'</span>'
				 +'<input type="text" class="form-control" placeholder="Company name" id="WINDOW_ID_company_name">'
				 +'<span class="input-group-btn">'
				 +'<button id="WINDOW_ID_create_company" class="btn btn-default" type="button">Create</button>'
				 +'</span>'
				 +'</div>'
		},
		init: function(d, cb) {
			
			var map_center = CORE.ui.map.getCenter();

			var marker = CORE.ui.map.markers.add(
				CORE.ui.map.markers.MARKER_TYPE_HQ_CREATE,
				map_center.lat,
				map_center.lng,
				{
					id: 'company_create',
					draggable: true,
					return: true,
					zIndex: 3,
					name: 'New company'
				}
			);

			cb(d);
		},
		runtime: function(d, cb) {

			CORE.game.update();

			$('#' + d.id + '_center_marker').click(function() {
				var pos = CORE.ui.map.getCenter();
				CORE.ui.map.markers.setPosition(CORE.ui.map.markers.get('company_create'), pos.lat, pos.lng);
			});

			$('#' + d.id + '_go_to_marker').click(function() {
				var pos = CORE.ui.map.markers.getPosition('company_create');
				CORE.ui.map.centerTo(pos.lat, pos.lng);
			});
			
			$('#' + d.id + '_create_company').click($.proxy(function(id) {

				var mpos = CORE.ui.map.markers.getPosition('company_create');
				var name = $('#' + id + '_company_name').val();

				$('#' + id + '_input_group').removeClass('has-error');
				$('#' + id + '_error_box').addClass('hide').text("");

				$('#' + d.id + '_create_company').removeClass('btn-danger').addClass('btn-default');
				$('#' + d.id + '_center_marker').removeClass('btn-danger').addClass('btn-default');
				$('#' + d.id + '_go_to_marker').removeClass('btn-danger').addClass('btn-default');

				if(!name) {
					$('#' + id + '_input_group').addClass('has-error');
					$('#' + id + '_error_box').text(API.getErrorMessage(100)).removeClass('hide');

					$('#' + id + '_create_company').removeClass('btn-default').addClass('btn-danger');
					$('#' + id + '_center_marker').removeClass('btn-default').addClass('btn-danger');
					$('#' + id + '_go_to_marker').removeClass('btn-default').addClass('btn-danger');

				} else {

					API.call(
						API.ACTION_COMPANY_CREATE,
						{
							n: name,
							lat: mpos.lat,
							lng: mpos.lng
						},
						function(d, ed) {
							console.log('HERE');
							console.log(d);
							console.log(ed);
							if(d.err) {
								$('#' + ed.id + '_input_group').addClass('has-error');
								$('#' + ed.id + '_error_box').text(API.getErrorMessage(d.err)).removeClass('hide');

								$('#' + ed.id + '_create_company').removeClass('btn-default').addClass('btn-danger');
								$('#' + ed.id + '_center_marker').removeClass('btn-default').addClass('btn-danger');
								$('#' + ed.id + '_go_to_marker').removeClass('btn-default').addClass('btn-danger');

							}else {
								CORE.ui.windows.close(ed.id);
								API.call(API.ACTION_USER_SET_ACTIVE_COMPANY, {
									i: d.id
								},function(d, ed) {
									CORE.company.set_active_company([ed], function() {
										return;
									});
								}, {type: CORE.company.TYPE_HQ, id: d.id, branch_name: ed.name, lat: ed.lat, lng: ed.lng});
							}
						},
						{
							id: id,
							name: name,
							lat: mpos.lat,
							lng: mpos.lng
						}
					);

				}

			}, null, d.id));

			cb(d);
		},
		close: function(d, cb) {
			CORE.ui.map.markers.delete('company_create');
			cb(d);
		}
	},
	'branch_create': {
		code: {
			title: 'Create branch',
			body: '<div class="alert alert-danger hide" role="alert" id="WINDOW_ID_error_box"></div>'
				 +'<div class="input-group" id="WINDOW_ID_input_group">'
				 +'<span class="input-group-btn">'
				 +'<button id="WINDOW_ID_center_marker" class="btn btn-default" type="button" data-toggle="tooltip" data-placement="top" title="Center HQ">'
				 +'<span class="glyphicon glyphicon-screenshot"></span>'
				 +'</button>'
				 +'<button id="WINDOW_ID_go_to_marker" class="btn btn-default" type="button" data-toggle="tooltip" data-placement="top" title="Go to HQ">'
				 +'<span class="glyphicon glyphicon-home"></span>'
				 +'</button>'
				 +'</span>'
				 +'<input type="text" class="form-control" placeholder="Branch name" id="WINDOW_ID_company_name">'
				 +'<span class="input-group-btn">'
				 +'<button id="WINDOW_ID_create_company" class="btn btn-default" type="button">Create</button>'
				 +'</span>'
				 +'</div>'
		},
		init: function(d, cb) {
			
			var map_center = CORE.ui.map.getCenter();

			var marker = CORE.ui.map.markers.add(
				CORE.ui.map.markers.MARKER_TYPE_BRANCH_CREATE,
				map_center.lat,
				map_center.lng,
				{
					id: 'branch_create',
					draggable: true,
					return: true,
					zIndex: 3,
					name: 'New branch'
				}
			);
			
			cb(d);
		},
		runtime: function(d, cb) {

			CORE.game.update();

			$('#' + d.id + '_center_marker').click(function() {
				var pos = CORE.ui.map.getCenter();
				CORE.ui.map.markers.setPosition(CORE.ui.map.markers.get('branch_create'), pos.lat, pos.lng);
			});

			$('#' + d.id + '_go_to_marker').click(function() {
				var pos = CORE.ui.map.markers.getPosition('branch_create');
				CORE.ui.map.centerTo(pos.lat, pos.lng);
			});
			
			$('#' + d.id + '_create_company').click($.proxy(function(id) {

				var mpos = CORE.ui.map.markers.getPosition('branch_create');
				var name = $('#' + id + '_company_name').val();

				$('#' + id + '_input_group').removeClass('has-error');
				$('#' + id + '_error_box').addClass('hide').text("");

				$('#' + d.id + '_create_company').removeClass('btn-danger').addClass('btn-default');
				$('#' + d.id + '_center_marker').removeClass('btn-danger').addClass('btn-default');
				$('#' + d.id + '_go_to_marker').removeClass('btn-danger').addClass('btn-default');

				if(!name) {
					$('#' + id + '_input_group').addClass('has-error');
					$('#' + id + '_error_box').text(API.getErrorMessage(100)).removeClass('hide');

					$('#' + id + '_create_company').removeClass('btn-default').addClass('btn-danger');
					$('#' + id + '_center_marker').removeClass('btn-default').addClass('btn-danger');
					$('#' + id + '_go_to_marker').removeClass('btn-default').addClass('btn-danger');

				} else {

					API.call(
						API.ACTION_BRANCH_CREATE,
						{
							n: name,
							lat: mpos.lat,
							lng: mpos.lng
						},
						function(d, ed) {
							if(d.err) {
								$('#' + ed.id + '_input_group').addClass('has-error');
								$('#' + ed.id + '_error_box').text(API.getErrorMessage(d.err)).removeClass('hide');

								$('#' + ed.id + '_create_company').removeClass('btn-default').addClass('btn-danger');
								$('#' + ed.id + '_center_marker').removeClass('btn-default').addClass('btn-danger');
								$('#' + ed.id + '_go_to_marker').removeClass('btn-default').addClass('btn-danger');

							}else {
								CORE.ui.windows.close(ed.id);
								CORE.ui.map.centerTo(ed.lat, ed.lng);
								CORE.ui.map.zoomTo(12);
							}
						},
						{
							id: id,
							name: name,
							lat: mpos.lat,
							lng: mpos.lng
						}
					);

				}

			}, null, d.id));

			cb(d);
		},
		close: function(d, cb) {
			console.log('HERE');
			CORE.ui.map.markers.delete('branch_create');
			cb(d);
		}
	},
	'finances': {
		multiple: true,
		code: {
			title: 'Finances',
			body: 'BRANCHES_LIST',
			footer: ''
		},
		init: function(d, cb) {

			API.call(API.ACTION_COMPANY_GET_BRANCHES, {
				i: CORE.user.info.id_active_company,
				f: 'employees, money'
			}, function(d, ed) {

				var b, et = 0, mt = 0;

				b = '<tr><td>Branch</td><td>Employees</td><td>Money</td></tr>';

				for(var i=0;i<d.length;i++) {
					b += '<tr><td>' + d[i].branch_name + '</td><td>' + d[i].employees + '</td><td>' + d[i].money + '&nbsp;<span class="glyphicon glyphicon-euro" aria-hidden="true"></span></td></tr>'
					et += parseInt(d[i].employees);
					mt += parseInt(d[i].money);
				}

				b+= '<tr><td></td><td></td><td></td></tr>';
				b+= '<tr><td>Total</td><td>' + et + '</td><td>' + mt + '&nbsp;<span class="glyphicon glyphicon-euro" aria-hidden="true"></span></td></tr>';

				b = '<table class="table table-striped table-bordered text-center">' + b + '</table>';

				ed.d.body = UTILS.replace(ed.d.body, 'BRANCHES_LIST', b);

				cb(ed.d);

			}, {d: d, cb: cb});

		},
		runtime: function(d, cb) {
			cb(d);
		},
		cycle: function(id) {
			
			API.call(API.ACTION_COMPANY_GET_BRANCHES, {
				i: CORE.user.info.id_active_company,
				f: 'employees, money'
			}, function(d, ed) {

				var b, et = 0, mt = 0;

				b = '<tr><td>Branch</td><td>Employees</td><td>Money</td></tr>';

				for(var i=0;i<d.length;i++) {
					b += '<tr><td>' + d[i].branch_name + '</td><td>' + d[i].employees + '</td><td>' + d[i].money + '&nbsp;<span class="glyphicon glyphicon-euro" aria-hidden="true"></span></td></tr>'
					et += parseInt(d[i].employees);
					mt += parseInt(d[i].money);
				}

				b+= '<tr><td></td><td></td><td></td></tr>';
				b+= '<tr><td>Total</td><td>' + et + '</td><td>' + mt + '&nbsp;<span class="glyphicon glyphicon-euro" aria-hidden="true"></span></td></tr>';

				b = '<table class="table table-striped table-bordered text-center">' + b + '</table>';

				$('#' + ed.id + ' .modal-body').html(b);

			}, {id: id});

		},
		close: function(d, cb) {cb(d);}
	}
};

/*
░ █ ▀ ▄ ▀ █ 　░ █ ▀ ▀ ▀ 　░ █ ▀ ▀ █ 　░ █ ─ ░ █ 　─ █ ▀ ▀ █ 　░ █ ▄ ─ ░ █ 　▀ █ ▀ 　░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ █ 　
░ █ ░ █ ░ █ 　░ █ ▀ ▀ ▀ 　░ █ ─ ─ ─ 　░ █ ▀ ▀ █ 　░ █ ▄ ▄ █ 　░ █ ░ █ ░ █ 　░ █ ─ 　░ █ ─ ─ ─ 　─ ▀ ▀ ▀ ▄ ▄ 　
░ █ ─ ─ ░ █ 　░ █ ▄ ▄ ▄ 　░ █ ▄ ▄ █ 　░ █ ─ ░ █ 　░ █ ─ ░ █ 　░ █ ─ ─ ▀ █ 　▄ █ ▄ 　░ █ ▄ ▄ █ 　░ █ ▄ ▄ ▄ █ 　
*/

CORE.ui.windows.create = function(type, opts) {

	CORE.ui.windows.movein();

	var id = "window_" + type;
	if(CORE.ui.windows.presets[type].multiple)
		id += '_' + Math.floor( Math.random() * 100000 );

	if(CORE.ui.windows.is_open(id)) {
		CORE.ui.windows.pop(id);
		return;
	}

	var body = "<div id=\"WINDOW_ID\" class=\"modal fade in\" aria-hidden=\"false\" style=\"display: block;z-index:ZINDEX;left:-99999px;top: -99999px;\">"
			  + "<div class=\"modal-dialog\">"
			  + "<div class=\"modal-content\">"
			  + "<div class=\"modal-header\" id=\"WINDOW_ID_header\">"
			  + "<button type=\"button\" class=\"close WINDOW_ID_close\" aria-hidden=\"true\">&#215;</button>"
			  + "<h4 class=\"modal-title\">"
			  + CORE.ui.windows.presets[type].code.title
			  + "</h4>"
			  + "</div>"
			  + "<div class=\"modal-body\">"
			  + CORE.ui.windows.presets[type].code.body
			  + "</div>"
			  + (CORE.ui.windows.presets[type].code.footer ? "<div class=\"modal-footer\">" : "")
			  + (CORE.ui.windows.presets[type].code.footer ? CORE.ui.windows.presets[type].code.footer : "")
			  + (CORE.ui.windows.presets[type].code.footer ? "</div>" : "")
			  + "</div>"
			  + "</div>"
			  + "</div>";

	CORE.ui.windows.zindex++;

	CORE.ui.windows.presets[type].init({
		type: type,
		id: id,
		body: body,
		opts: opts
	}, function(d) {

		d.body = UTILS.replace(d.body, 'WINDOW_ID', d.id);
		d.body = UTILS.replace(d.body, 'ZINDEX', CORE.ui.windows.zindex);

		if(!d.opts) d.opts = {};
		if(!d.opts.left) d.opts.left = 'center';
		if(!d.opts.top) d.opts.top = 'center';

		$("#windows").append(d.body);
		$('#' + d.id).draggable({
			handle: "#" + d.id + "_header",
			containment: "window"
		}).on('mousedown', function() {
			if($(this).css('z-index') != CORE.ui.windows.zindex) {
				CORE.ui.windows.zindex++;
				$(this).css('z-index', CORE.ui.windows.zindex);
			}
		}).data('type', d.type);

		var l, t;

		if(d.opts.left == 'left') l = 0;
		else if(d.opts.left == 'center') l = $(CORE.win).width() / 2 - $('#' + d.id).width() / 2;
		else if(d.opts.left == 'right') l = $(CORE.win).width() - $('#' + d.id).width();
		else if(typeof d.opts.left == 'number') l = d.opts.left;

		if(d.opts.top == 'top') t = CORE.settings.ui.windows.v_offset;
		else if(d.opts.top == 'center') t = $(CORE.win).height() / 2 - $('#' + d.id).height() / 2;
		else if(d.opts.top == 'bottom') t = $(CORE.win).height() - $('#' + d.id).height() - CORE.settings.ui.windows.v_offset;
		else if(typeof d.opts.top == 'number') t = d.opts.top;

		$('#' + d.id).css({
			'left': l + 'px',
			'top': t + 'px'
		});

		$('.' + d.id + '_close').click($.proxy(function(d) {
			CORE.ui.windows.close(d.id);
		}, null, d));

		CORE.ui.windows.storage.push(id);

		if(CORE.ui.windows.presets[d.type].cycle)
			CORE.game.cycle.subscribe(id, (CORE.ui.windows.presets[d.type].cycle).bind(null, d.id));
		
		CORE.ui.windows.presets[type].runtime(d, function(d) {return;});
		
	});

};

CORE.ui.windows.is_open = function(id) {
	return ( CORE.ui.windows.storage.indexOf(id) != -1 ? true : false );
};

CORE.ui.windows.close = function(id) {

	if(!type) var type = $('#' + id).data('type');

	CORE.ui.windows.presets[type].close(id, function(id) {
		CORE.ui.windows.delete( id );
	});
};

CORE.ui.windows.delete = function(id) {
	$('#' + id).remove();
	CORE.game.cycle.unsubscribe(id);
	for(var i=0;i<CORE.ui.windows.storage.length;i++)
		if(CORE.ui.windows.storage[i] == id) {
			CORE.ui.windows.storage.splice(i, 1);
			break;
		}
}

CORE.ui.windows.delete_all = function() {
	CORE.ui.windows.moveout(true, function() {
		setTimeout(function() {
			var len = CORE.ui.windows.storage.length;
			for(var i=0;i<len;i++)
				CORE.ui.windows.delete(CORE.ui.windows.storage[0]);
			CORE.ui.windows.zindex = 0;
		}, 150);
	});
};

CORE.ui.windows.pop = function(id) {
	if(CORE.ui.windows.is_open(id)) {
		$('#' + id).css('z-index', CORE.ui.windows.zindex++).addClass('window_pop');
		setTimeout((function(id){
			console.log('HERE: ' + id);
			$('#' + id).removeClass('window_pop');
		}).bind(null, id), 200);
	}
};

CORE.ui.windows.move_state = false;
CORE.ui.windows.moveout = function(bypass, cb) {
	if(CORE.ui.windows.move_state && !bypass) return;
	var w = $(window).width();
	for(var i=0;i<CORE.ui.windows.storage.length;i++) {
		var e = $('#' + CORE.ui.windows.storage[i]);
		var l = parseFloat(e.css('left'));
		if(l + e.width() / 2 > w / 2)
			e.css('margin-left', ( l + w ) + 'px');
		else
			e.css('margin-left', ( l - w ) + 'px');
	}

	if(!bypass) {
		$('#navbar_windows_move_toggle span').addClass('glyphicon-resize-small').removeClass('glyphicon-resize-full');
		CORE.ui.windows.move_state = true;
	}

	if(cb)
		cb();

};

CORE.ui.windows.movein = function() {
	if(!CORE.ui.windows.move_state) return;
	for(var i=0;i<CORE.ui.windows.storage.length;i++) 
		$('#' + CORE.ui.windows.storage[i]).css('margin-left', '0px');

	$('#navbar_windows_move_toggle span').addClass('glyphicon-resize-full').removeClass('glyphicon-resize-small');

	CORE.ui.windows.move_state = false;
};

CORE.ui.windows.movetoggle = function() {
	if(CORE.ui.windows.move_state)
		CORE.ui.windows.movein();
	else
		CORE.ui.windows.moveout();
};

/*
░ █ ▀ ▄ ▀ █ 　─ █ ▀ ▀ █ 　░ █ ▀ ▀ █ 　
░ █ ░ █ ░ █ 　░ █ ▄ ▄ █ 　░ █ ▄ ▄ █ 　
░ █ ─ ─ ░ █ 　░ █ ─ ░ █ 　░ █ ─ ─ ─ 　

*/

CORE.ui.map = {};
CORE.ui.map.style = [
  {
	"elementType": "labels",
	"stylers": [
	  { "visibility": "off" }
	]
  },/*{
	"elementType": "geometry.stroke",
	"stylers": [
	  { "visibility": "off" }
	]
  },*/{
	"featureType": "road",
	"stylers": [
	  { "visibility": "off" }
	]
  },{
	"featureType": "transit",
	"stylers": [
	  { "visibility": "off" }
	]
  },/*{
	"featureType": "administrative",
	"stylers": [
	  { "visibility": "off" }
	]
  },*/{
	"featureType": "poi",
	"stylers": [
	  { "visibility": "off" }
	]
  },{
	"featureType": "landscape.man_made",
	"stylers": [
	  { "visibility": "off" }
	]
  }
];
CORE.ui.map.obj = null;
CORE.ui.map.lazy_data = null;
CORE.ui.map.init = function(lat, lng, cb) {
	var styledMap = new google.maps.StyledMapType(CORE.ui.map.style, {name: "World Map"});
		  
	var mapOptions = {
	  center: { lat: parseFloat(lat), lng: parseFloat(lng)},
	  zoom: 12,
	  mapTypeId: google.maps.MapTypeId.TERRAIN, //SATELLITE
	  disableDefaultUI: true
	};
	CORE.ui.map.obj = new google.maps.Map(document.getElementById('map-container'), mapOptions);
		
	CORE.ui.map.obj.mapTypes.set('map_style', styledMap);
	CORE.ui.map.obj.setMapTypeId('map_style');

	CORE.ui.map.calculate_lazy_data();

	cb();

};
CORE.ui.map.calculate_lazy_data = function() {
	
	var c = CORE.ui.map.obj.getCenter();

	CORE.ui.map.lazy_data = {
		center: {
			lat: c.lat(),
			lng: c.lng()
		},
		bounds: {
			delta: {
				lat: CORE.settings.ui.map.lazy_data_delta.lat,
				lng: CORE.settings.ui.map.lazy_data_delta.lng
			}
		}

	};
};
CORE.ui.map.getCenter = function() {
	var c = CORE.ui.map.obj.getCenter();
	return {lat: c.A, lng: c.F};
};
CORE.ui.map.centerTo = function(lat, lng) {
	CORE.ui.map.obj.setCenter(CORE.ui.map.latlng(lat, lng));
};
CORE.ui.map.zoomTo = function(zoom) {
	CORE.ui.map.obj.setZoom( Math.floor( zoom < 0 ? 0 : (zoom > 12 ? 12 : zoom) ) );//official: 19
};
CORE.ui.map.latlng = function(lat, lng) {
	return new google.maps.LatLng(lat, lng);
};
CORE.ui.map.populate_event = false;
CORE.ui.map.populate = function(bypass) {

	if(CORE.ui.map.obj.getZoom() >= 10 && // 7, 8 ... 10
	  	(
	  		(CORE.ui.map.lazy_data.center.lat + CORE.ui.map.lazy_data.bounds.delta.lat < CORE.ui.map.obj.getCenter().lat() || CORE.ui.map.lazy_data.center.lat - CORE.ui.map.lazy_data.bounds.delta.lat > CORE.ui.map.obj.getCenter().lat()) ||
	  		(CORE.ui.map.lazy_data.center.lng + CORE.ui.map.lazy_data.bounds.delta.lng < CORE.ui.map.obj.getCenter().lng() || CORE.ui.map.lazy_data.center.lng - CORE.ui.map.lazy_data.bounds.delta.lng > CORE.ui.map.obj.getCenter().lng()) ||
	  		bypass
	  	)
	  ) {

		CORE.ui.map.calculate_lazy_data();

		var bounds = CORE.ui.map.obj.getBounds();
		if(bounds)
			CORE.ui.map.populate_next(bounds);
		else {
			if(CORE.ui.map.populate_event) {
				google.maps.event.removeListener(CORE.ui.map.populate_event);
				CORE.ui.map.populate_event = false;
			}

			CORE.ui.map.populate_event = google.maps.event.addListener(CORE.ui.map.obj, 'bounds_changed', function() {
				google.maps.event.removeListener(CORE.ui.map.populate_event);
				CORE.ui.map.populate_event = false;
				CORE.ui.map.populate_next(CORE.ui.map.obj.getBounds());
			});

		}

	}

};

CORE.ui.map.populate_next = function(bounds) {
	var NE = bounds.getNorthEast();
	var SW = bounds.getSouthWest();
	API.call(API.ACTION_COMPANY_GET_IN_BOUNDS, {
		b1_lat: NE.lat(),
		b1_lng: NE.lng(),
		b2_lat: SW.lat(),
		b2_lng: SW.lng(),
		b: 1
	}, function(d) {

		var i, j, m = CORE.ui.map.markers.getAll(['other_company']), k;
		for(i=0;i<m.length;i++) {
			for(j=0;j<d.length;j++) {
				if(CORE.ui.map.markers.getProp(m[i], 'branch_name') == d[j]['branch_name']) {
					d.splice(j, 1);
					j--;
					break;
				}
			}
		}

		for(i=0;i<d.length;i++) {
			CORE.ui.map.markers.add(null, d[i]['lat'], d[i]['lng'], {
				'other_company': true,
				'branch_name': d[i]['branch_name'],
				'company_name': d[i]['company_name'],
				'type': d[i]['type'],
				'zIndex': 1
			});
		}

	});
};

/*
░ █ ▀ ▄ ▀ █ 　─ █ ▀ ▀ █ 　░ █ ▀ ▀ █ 　░ █ ─ ▄ ▀ 　░ █ ▀ ▀ ▀ 　░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ █ 　
░ █ ░ █ ░ █ 　░ █ ▄ ▄ █ 　░ █ ▄ ▄ ▀ 　░ █ ▀ ▄ ─ 　░ █ ▀ ▀ ▀ 　░ █ ▄ ▄ ▀ 　─ ▀ ▀ ▀ ▄ ▄ 　
░ █ ─ ─ ░ █ 　░ █ ─ ░ █ 　░ █ ─ ░ █ 　░ █ ─ ░ █ 　░ █ ▄ ▄ ▄ 　░ █ ─ ░ █ 　░ █ ▄ ▄ ▄ █ 　
*/

CORE.ui.map.markers = {};
CORE.ui.map.markers.storage = {};
CORE.ui.map.markers.BASE_ICON_STORAGE = '/assets/img/map/icons/';
CORE.ui.map.markers.MARKER_TYPE_HQ = 'hq_icon';
CORE.ui.map.markers.MARKER_TYPE_HQ_CREATE = 'hq_red_icon';
CORE.ui.map.markers.MARKER_TYPE_BRANCH = 'hq_green_icon';
CORE.ui.map.markers.MARKER_TYPE_BRANCH_CREATE = 'hq_purple_icon';
CORE.ui.map.markers.add = function(type, lat, lng, opts) {

	if(!opts) var opts = {};

	var title = '';

	if(parseInt(opts.type) === CORE.company.TYPE_HQ) {
		title = '<h6>' + opts.branch_name + '</h6><span class="label label-default">HeadQuarters</span>';
		if(!type) type = CORE.ui.map.markers.MARKER_TYPE_HQ;
	} else if(parseInt(opts.type) === CORE.company.TYPE_BRANCH_UNASSIGNED) {
		title = '<h6>' + opts.branch_name + '</h6><span class="label label-default">Branch - ' + opts.company_name + '</span>';
		if(!type) type = CORE.ui.map.markers.MARKER_TYPE_BRANCH;
	}


	var marker = new google.maps.Marker({
		position: CORE.ui.map.latlng(lat, lng),
		map: CORE.ui.map.obj,
		draggable: ( opts.draggable ? true : false ),
		icon: CORE.ui.map.markers.BASE_ICON_STORAGE + type + '.png',
		zIndex: (opts.zIndex ? opts.zIndex : 1)
	});

	for(opt in opts)
		if(opt != 'id' && opt != 'return' && opt != 'zIndex')
			marker.set(opt, opts[opt]);

	var infowindow = new google.maps.InfoWindow({
	    content: title,
	    disableAutoPan : true
	});

	marker.set('infowindow', infowindow);

	google.maps.event.addListener(marker, 'mouseover', $.proxy(function(d) {
	    d.infowindow.open(CORE.ui.map.obj,d.marker);
	}, null, {marker: marker, infowindow: infowindow}));

	google.maps.event.addListener(marker, 'mouseout', $.proxy(function(d) {
	    d.infowindow.close();
	}, null, {infowindow: infowindow}));

	var id =   opts.id || Math.floor( Math.random() * 1000000 );

	marker.set('id', id);

	CORE.ui.map.markers.storage[ id ] = marker;

	if(opts.return)
		return marker;

};
CORE.ui.map.markers.get = function(id) {
	return CORE.ui.map.markers.storage[id];
};
CORE.ui.map.markers.getAll = function(opts) {
	var k, m = [];
	if(opts) q = (opts.constructor);
	for(id in CORE.ui.map.markers.storage) {
		k=1;
		if(opts) {
			if(q === Array) {
				for(var i=0;i<opts.length;i++)
					if(!CORE.ui.map.markers.storage[id].get(opts[i])) {
						k=0;
						break;
					}
			} else {
				for(opt in opts)
					if(CORE.ui.map.markers.storage[id].get(opt) !== opts[opt]) {
						k=0;
						break;
					}
			}
		}
		if(k)
			m.push(CORE.ui.map.markers.storage[id]);
	}
	return m;
};
CORE.ui.map.markers.getPosition = function(id) {
	var pos = CORE.ui.map.markers.get(id).getPosition();
	return {lat: pos.A, lng: pos.F};
};
CORE.ui.map.markers.setPosition = function(thing, lat, lng) {
	if(typeof thing != 'object')
		thing = CORE.ui.map.markers.get(thing);

	thing.setPosition( CORE.ui.map.latlng(lat, lng) );
};
CORE.ui.map.markers.getProp = function(thing, prop) {
	if(typeof thing != 'object') {
		thing = CORE.ui.map.markers.get(thing);
	}

	var res = thing.get(prop);

	if(prop == 'position')
		res = {lat: res.A, lng: res.F};

	return res;

}
CORE.ui.map.markers.delete = function(thing) {

	if(typeof thing != 'object')
		thing = CORE.ui.map.markers.get(thing);

	if(thing) {
		thing.setMap(null);
		delete CORE.ui.map.markers.storage[thing.get('id')];
		delete thing;
	}

};
CORE.ui.map.markers.delete_all = function(opts) {
	var i = 0, m = CORE.ui.map.markers.getAll(opts);
	for(;i<m.length;i++) 
		CORE.ui.map.markers.delete( m[i] );
};

CORE.ui.map.markers.clear_nonvisible = function() {

	for(var i=0;i<CORE.ui.map.markers.storage.length;i++) {

		if( !CORE.ui.map.obj.getBounds().contains(CORE.ui.map.markers.storage[i].getPosition()) ) {
			CORE.ui.map.markers.delete(CORE.ui.map.markers.storage[i]);
		}

	}

};

CORE.ui.map.markers.show_infowindow = function(thing) {
	if(typeof thing != 'object')
		thing = CORE.ui.map.markers.get(thing);
	if(thing.get('infowindow').getContent() != '')
		thing.get('infowindow').open(CORE.ui.map.obj, thing);
};

CORE.ui.map.markers.show_infowindow_all = function() {
	for(id in CORE.ui.map.markers.storage)
		CORE.ui.map.markers.show_infowindow( CORE.ui.map.markers.storage[id] );
};

CORE.ui.map.markers.hide_infowindow = function(thing) {
	if(typeof thing != 'object')
		thing = CORE.ui.map.markers.get(thing);
	thing.get('infowindow').close();
};

CORE.ui.map.markers.hide_infowindow_all = function() {
	console.log('hide');
	for(id in CORE.ui.map.markers.storage)
		CORE.ui.map.markers.hide_infowindow( CORE.ui.map.markers.storage[id] );
};

/*
░ █ ─ ░ █ 　░ █ ▀ ▀ ▀ █ 　░ █ ▀ ▀ ▀ 　░ █ ▀ ▀ █ 　
░ █ ─ ░ █ 　─ ▀ ▀ ▀ ▄ ▄ 　░ █ ▀ ▀ ▀ 　░ █ ▄ ▄ ▀ 　
─ ▀ ▄ ▄ ▀ 　░ █ ▄ ▄ ▄ █ 　░ █ ▄ ▄ ▄ 　░ █ ─ ░ █ 　

*/

CORE.user = {};
CORE.user.getInfo = function (username, cb) {

	if(!cb && typeof username == 'function') var cb = username;

	var d = {};
	if(typeof username == 'string')
		d.u = username;
	else
		d.utk = API.getCookie('utk');

	API.call(API.ACTION_USER_GET_INFO, d, cb);
};
CORE.user.is_logged_in = function(cb) {
	API.call(API.ACTION_IS_LOGGED_IN, null, cb);
};

/*
░ █ ▀ ▀ █ 　░ █ ▀ ▀ ▀ █ 　░ █ ▀ ▄ ▀ █ 　░ █ ▀ ▀ █ 　─ █ ▀ ▀ █ 　░ █ ▄ ─ ░ █ 　░ █ ─ ─ ░ █ 　
░ █ ─ ─ ─ 　░ █ ─ ─ ░ █ 　░ █ ░ █ ░ █ 　░ █ ▄ ▄ █ 　░ █ ▄ ▄ █ 　░ █ ░ █ ░ █ 　░ █ ▄ ▄ ▄ █ 　
░ █ ▄ ▄ █ 　░ █ ▄ ▄ ▄ █ 　░ █ ─ ─ ░ █ 　░ █ ─ ─ ─ 　░ █ ─ ░ █ 　░ █ ─ ─ ▀ █ 　─ ─ ░ █ ─ ─ 　

*/

CORE.company = {};
CORE.company.TYPE_HQ = 1;
CORE.company.TYPE_BRANCH_UNASSIGNED = 0;
CORE.company.getInfo = function(id, cb, b) {
	API.call(API.ACTION_COMPANY_GET_INFO, {
		i: id,
		b: ( b ? b : 0)
	}, cb);
};
CORE.company.set_active_company = function(d, cb) {

	console.log(d);

	$('.navbar_company_buttons').removeClass('hidden');

	CORE.ui.map.markers.delete_all();

	var c_lat, c_lng;

	for(var i=0;i<d.length;i++) {
		CORE.ui.map.markers.add(null, d[i]['lat'], d[i]['lng'], {
			'branch_name': d[i]['branch_name'],
			'company_name': d[i]['company_name'],
			'type': d[i].type,
			'zIndex': 1
		});

		if(parseInt(d[i]['type']) === CORE.company.TYPE_HQ) {

			c_lat = d[i].lat;
			c_lng = d[i].lng;

			$('#navbar_company_name .name').text(d[i]['branch_name']);

			CORE.user.info.id_active_company = d[i].id_company;

		}
	}

	$('#map_controls_hq').removeClass('hidden').unbind('click').bind('click', (function(lat, lng) {
		CORE.ui.map.centerTo(lat, lng);
		CORE.ui.map.zoomTo(12);
	}).bind(null, c_lat, c_lng));

	CORE.ui.map.centerTo(c_lat, c_lng);
	CORE.ui.map.zoomTo(12);

	cb(d);

};

UTILS = {};
UTILS.replace = function(s, n, r) {
	return s.replace(new RegExp(n, 'g'), r);
};

/*========UTILS=======*/

if (typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

