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
		interval: 500
	},
	ui: {
		windows: {
			v_offset: 53
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
				
				CORE.game.populate_map(true);

				if(CORE.ui.map.obj.getZoom() > 12)
					CORE.ui.map.zoomTo(12);
				if(CORE.ui.map.obj.getZoom() < 2)
					CORE.ui.map.zoomTo(2);

				if(CORE.ui.map.obj.getZoom() >= 10) {
					CORE.ui.map.markers.show_infowindow_all();
				}else {
					CORE.ui.map.markers.hide_infowindow_all();
				}

			});

			google.maps.event.addListener(CORE.ui.map.obj, 'center_changed', function() {

				//if(!CORE.ui.map.lazy_data) CORE.ui.map.calculate_lazy_data(); 

				CORE.game.populate_map();

			});

		});

		if(!parseInt(d.id_active_company)) {
			$('#navbar_company_name').text("No active company");
		} else {
			CORE.company.getInfo(d.id_active_company, function(d) {
				CORE.company.set_active_company(d, function(d) {

				});
			});
		}

		$('#navbar_company_finances').click(function() {
			CORE.ui.windows.create('finances');
		});

		$('#navbar_company_switch').click(function() {
			CORE.ui.windows.create('user_company_switch');
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

CORE.game.populate_map = function(bypass) {
	if(CORE.ui.map.obj.getZoom() >= 1 && // 7, 8 ... 10
	  	(
	  		(CORE.ui.map.lazy_data.center.lat + CORE.ui.map.lazy_data.bounds.delta.lat < CORE.ui.map.obj.getCenter().lat() || CORE.ui.map.lazy_data.center.lat - CORE.ui.map.lazy_data.bounds.delta.lat > CORE.ui.map.obj.getCenter().lat()) ||
	  		(CORE.ui.map.lazy_data.center.lng + CORE.ui.map.lazy_data.bounds.delta.lng < CORE.ui.map.obj.getCenter().lng() || CORE.ui.map.lazy_data.center.lng - CORE.ui.map.lazy_data.bounds.delta.lng > CORE.ui.map.obj.getCenter().lng()) ||
	  		bypass
	  	)
	  ) {
		
		console.log('NEW');
		console.log(CORE.ui.map.lazy_data.center.lat + CORE.ui.map.lazy_data.bounds.delta.lat)
		console.log(CORE.ui.map.obj.getCenter().lat());
		console.log(CORE.ui.map.lazy_data.center.lat - CORE.ui.map.lazy_data.bounds.delta.lat)

		CORE.ui.map.calculate_lazy_data();

		var bounds = CORE.ui.map.obj.getBounds();
		if(bounds) {
			var NE = bounds.getNorthEast();
			var SW = bounds.getSouthWest();

			API.call(API.ACTION_COMPANY_GET_IN_BOUNDS, {
				b1_lat: NE.lat(),
				b1_lng: NE.lng(),
				b2_lat: SW.lat(),
				b2_lng: SW.lng()
			}, function(d) {

				var i, j, m = CORE.ui.map.markers.getAll(['other_company']), cd = d, k;
				for(i=0;i<m.length;i++) {
					k=1;
					for(j=0;j<cd.length;j++) {
						if(CORE.ui.map.markers.getProp(m[i], 'title') == cd[i]['name']) {
							k=0;
							cd.splice(j, 1);
							break;
						}
					}
					if(k)
						CORE.ui.map.markers.delete(m[i]);
				}

				for(i=0;i<d.length;i++) {
					CORE.ui.map.markers.add(CORE.ui.map.markers.MARKER_TYPE_HQ, d[i]['lat'], d[i]['lng'], {
						'other_company': true,
						'title': d[i]['name']
					});
				}

			});
		}

	}
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

CORE.ui.windows.storage = [];
CORE.ui.windows.zindex = 0;
CORE.ui.windows.presets = {
	'user_company_switch': {
		code: {
			title: 'Companies',
			body: '<div class="row">'
				 +'<div class="col-xs-12">'
				 +'<button id="WINDOW_ID_create_company" class="btn btn-primary">Create company</button>'
				 +'</div>'
				 +'</div>'
				 +'<hr>'
				 +'<div class="row">'
				 +'<div class="col-xs-12">'
				 +'<h4>Switch comapny</h4>'
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
					l += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="WINDOW_ID_company_' + i + '" href="#">' + d[i].name + '</a><br>'
				}
				ed.d.body = UTILS.replace(ed.d.body, 'COMPANIES_LIST', l);
				ed.cb(ed.d);
			}, {d: d, cb: cb});
		},
		runtime: function(d, cb) {
			
			for(var i=0;i<d.companies.length;i++)
				$('#' + d.id + '_company_' + i).click($.proxy(function(d) {
					API.call(API.ACTION_USER_SET_ACTIVE_COMPANY, {
						i: d.id
					},function(d, ed) {
						CORE.company.set_active_company(ed.c, function() {
							return;
						});
					}, {c: d});
				}, null, d.companies[i]));

			$('#' + d.id + '_create_company').click($.proxy(function(id) {
				CORE.ui.windows.delete(id);
				CORE.ui.windows.create('company_create', {
					left: 'center',
					top: 'top'
				});
			}, null, d.id));

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
					return: true
				}
			);

			/*google.maps.event.addListener(marker, 'drag', $.proxy(function(d) {
				var pos = CORE.ui.map.markers.getProp(d.marker, 'position');
				console.log(pos);
					//pos.lat = pos.lat > 85 ? 85 : ( pos.lat < -85 ? -85 : pos.lat );
					//pos.lng = pos.lng > 180 ? 180 : ( pos.lng < -180 ? -180 : pos.lng );
			    CORE.ui.map.markers.setPosition( marker, pos.lat, pos.lng );
			}, null, {marker: marker}));*/

			/*google.maps.event.addListener(CORE.ui.map.obj, 'center_changed', $.proxy(function(d) {
				var id = CORE.ui.map.markers.getPropFromMarker(marker, 'id');
				var pos = CORE.ui.map.getCenter();
					pos.lat = pos.lat > 85 ? 85 : ( pos.lat < -85 ? -85 : pos.lat );
					//pos.lng = pos.lng > 180 ? 180 : ( pos.lng < -180 ? -180 : pos.lng );
			    CORE.ui.map.markers.setPosition( id, pos.lat, pos.lng );
			}, null, {marker: marker}));*/

			//move marker to the center of the map every time you move the map (don't forget to remove the event listener after you close the window)

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
							if(d.err) {
								$('#' + ed.id + '_input_group').addClass('has-error');
								$('#' + ed.id + '_error_box').text(API.getErrorMessage(d.err)).removeClass('hide');

								$('#' + ed.id + '_create_company').removeClass('btn-default').addClass('btn-danger');
								$('#' + ed.id + '_center_marker').removeClass('btn-default').addClass('btn-danger');
								$('#' + ed.id + '_go_to_marker').removeClass('btn-default').addClass('btn-danger');

							}else {
								CORE.ui.windows.delete(ed.id);
								API.call(API.ACTION_USER_SET_ACTIVE_COMPANY, {
									i: d.id
								},function(d, ed) {
									CORE.company.set_active_company(ed, function() {
										return;
									});
								}, {id: d.id, name: ed.name, lat: ed.lat, lng: ed.lng});
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
	'finances': {
		code: {
			title: 'Finances (DUMMY WINDOW)',
			body: 'Money: <span id="WINDOW_ID_money">0</span>',
			footer: ''
		},
		init: function(d, cb) {
			cb(d);
		},
		runtime: function(d, cb) {
			cb(d);
		},
		cycle: function(id) {
			$("#" + id + '_money').text( parseInt($("#" + id + '_money').text()) + Math.floor(Math.random() * 1000) );
		},
		close: function(cb) {cb();}
	}
};
CORE.ui.windows.create = function(type, opts) {

	CORE.ui.windows.movein();

	var id = "window_" + Math.floor( Math.random() * 100000 );
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
		});

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
			CORE.ui.windows.presets[d.type].close(d, $.proxy(function(d) {
				var c = $(this).attr('class').split(" ");
				for(var i=0;i<c.length;i++) {
					if(c[i].endsWith('_close')) {
						c = c[i];
						break;
					}
				}
				CORE.ui.windows.delete( c.split("_close")[0] );
			}, this));
		}, null, d));

		CORE.ui.windows.storage.push(id);

		if(CORE.ui.windows.presets[d.type].cycle)
			CORE.game.cycle.subscribe(id, (CORE.ui.windows.presets[d.type].cycle).bind(null, d.id));
		
		CORE.ui.windows.presets[type].runtime(d, function(d) {return;});
		
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
				lat: 10,
				lng: 10
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
CORE.ui.map.markers.add = function(type, lat, lng, opts) {

	if(!opts) var opts = {};

	var marker = new google.maps.Marker({
		position: CORE.ui.map.latlng(lat, lng),
		map: CORE.ui.map.obj,
		draggable: ( opts.draggable ? true : false ),
		icon: CORE.ui.map.markers.BASE_ICON_STORAGE + type + '.png'
	});

	for(opt in opts)
		if(opt != 'id' && opt != 'title' && opt != 'return')
			marker.set(opt, opts[opt]);

	var infowindow = new google.maps.InfoWindow({
	    content: opts.title || '',
	    disableAutoPan : true
	});

	marker.set('infowindow', infowindow);

	/*google.maps.event.addListener(marker, 'mouseover', $.proxy(function(d) {
	    d.infowindow.open(CORE.ui.map.obj,d.marker);
	}, null, {marker: marker, infowindow: infowindow}));

	google.maps.event.addListener(marker, 'mouseout', $.proxy(function(d) {
	    d.infowindow.close();
	}, null, {infowindow: infowindow}));*/

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
CORE.ui.map.markers.getPropFromMarker = function(marker, prop) {
	return marker.get(prop);
};
CORE.ui.map.markers.getPropFromId = function(id, prop) {
	var marker = CORE.ui.map.markers.get(id);
	return marker ? marker.get(prop) : undefined;
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

	thing.setMap(null);
	delete CORE.ui.map.markers.storage[thing.get('id')];
	delete thing;

};
CORE.ui.map.markers.delete_all = function() {
	for(id in CORE.ui.map.markers.storage) 
		CORE.ui.map.markers.delete( id );
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
CORE.company.getInfo = function(id, cb) {
	API.call(API.ACTION_COMPANY_GET_INFO, {
		i: id
	}, cb);
};
CORE.company.set_active_company = function(d, cb) {

	$('#navbar_company_name').text(d.name);

	$('.navbar_company_buttons').removeClass('hidden');

	$('#map_controls_hq').removeClass('hidden').unbind('click').bind('click', (function(lat, lng) {
		CORE.ui.map.centerTo(lat, lng);
		CORE.ui.map.zoomTo(12);
	}).bind(null, d.lat, d.lng));

	CORE.ui.map.markers.delete_all();

	CORE.ui.map.markers.add(CORE.ui.map.markers.MARKER_TYPE_HQ, d.lat, d.lng, {
		id: 'company_hq',
		title: '<h6>' + d.name + '</h6><span class="label label-default">HeadQuarters</span>'
	});

	CORE.ui.map.centerTo(d.lat, d.lng);
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

