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
				if(CORE.ui.map.obj.getZoom() > 12)
					CORE.ui.map.zoomTo(12);
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

/*=======WINDOWS=======*/

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
				ed.d.window = UTILS.replace(ed.d.window, 'COMPANIES_LIST', l);
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

			cb(d);
		}
	},
	'finances': {
		code: {
			title: 'Finances',
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
		}
	}
};
CORE.ui.windows.create = function(type) {

	CORE.ui.windows.movein();

	var id = "window_" + Math.floor( Math.random() * 100000 );
	var window = "<div id=\"WINDOW_ID\" class=\"modal fade in\" aria-hidden=\"false\" style=\"display: block;z-index:ZINDEX;left:-99999px;top: -99999px;\">"
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
		window: window
	}, function(d) {

		d.window = UTILS.replace(d.window, 'WINDOW_ID', d.id);
		d.window = UTILS.replace(d.window, 'ZINDEX', CORE.ui.windows.zindex);

		$("#windows").append(d.window);
		$('#' + d.id).draggable({
			handle: "#" + d.id + "_header",
			containment: "window"
		}).on('mousedown', function() {
			if($(this).css('z-index') != CORE.ui.windows.zindex) {
				CORE.ui.windows.zindex++;
				$(this).css('z-index', CORE.ui.windows.zindex);
			}
		}).css({
			'left': ( $(CORE.win).width() / 2 - $('#' + d.id).width() / 2 ) + 'px',
			'top': ( $(CORE.win).height() / 2 - $('#' + d.id).height() / 2 ) + 'px'
		});

		$('.' + d.id + '_close').click(function() {
			var c = $(this).attr('class').split(" ");
			for(var i=0;i<c.length;i++) {
				if(c[i].endsWith('_close')) {
					c = c[i];
					break;
				}
			}
			CORE.ui.windows.delete( c.split("_close")[0] );
		});

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

/*=========MAP========*/

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

	cb();

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

CORE.ui.map.markers = {};
CORE.ui.map.markers.storage = {};
CORE.ui.map.markers.BASE_ICON_STORAGE = '/assets/img/map/icons/';
CORE.ui.map.markers.MARKER_TYPE_HQ = 'hq_icon';
CORE.ui.map.markers.add = function(type, lat, lng, id) {

	var marker = new google.maps.Marker({
		position: CORE.ui.map.latlng(lat, lng),
		map: CORE.ui.map.obj,
		icon: CORE.ui.map.markers.BASE_ICON_STORAGE + type + '.png'
	});

	var id = 'marker_' +  ( id || Math.floor( Math.random() * 1000000 ) );

	marker.set('id', id);

	CORE.ui.map.markers.storage[id] = marker;
};
CORE.ui.map.markers.delete = function(id) {
	if(CORE.ui.map.markers.storage[id]) {
		CORE.ui.map.markers.storage[id].setMap(null);
		delete CORE.ui.map.markers.storage[id];
	}
};
CORE.ui.map.markers.delete_all = function() {
	for(id in CORE.ui.map.markers.storage) 
		CORE.ui.map.markers.delete( id );
};

/*========USER========*/

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

/*======COMPANY=======*/

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

	CORE.ui.map.markers.add(CORE.ui.map.markers.MARKER_TYPE_HQ, d.lat, d.lng, 'hq');

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

