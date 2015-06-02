<?php

	function company_get_info() {

		echo json_encode( db_exec_first("SELECT id_owner, name, lat, lng FROM companies WHERE id='" . db_esc( $_GET['i'] ) . "'") );

	}

	function company_create() {

		if( isset($_GET['n']) && !empty($_GET['n']) && strip_tags($_GET['n']) == $_GET['n'] && isset($_GET['lat']) && !empty($_GET['lat']) && isset($_GET['lng']) && !empty($_GET['lng']) ) {

			$c = db_exec_first("SELECT id FROM companies WHERE name='" . db_esc($_GET['n']) . "'");
			if(!$c) {

				db_exec("INSERT INTO companies VALUES ('', " . __get_user_id_form_utk() . ", '" . db_esc($_GET['n']) . "', 0, " . db_esc($_GET['lat']) . ", " . db_esc($_GET['lng']) . ")");

				$c = db_exec_first("SELECT id FROM companies WHERE name ='" . db_esc($_GET['n']) . "'");

				echo json_encode(['id' => $c['id']]);

			}else {

				echo json_encode(['err' => 101]);

			}

		}else {
			if(empty($_GET['n']))
				echo json_encode(['err' => 100]);
			else
				err(4);
		}

	}

	function company_get_in_bounds() {

		if(isset($_GET['b1_lat']) && is_numeric($_GET['b1_lat']) &&
		   isset($_GET['b1_lng']) && is_numeric($_GET['b1_lng']) &&
		   isset($_GET['b2_lat']) && is_numeric($_GET['b2_lat']) &&
		   isset($_GET['b2_lng']) && is_numeric($_GET['b2_lng'])) {

			//$c = 'lat <= ' . db_esc($_GET['b1_lat']) . ' AND lat >= ' . db_esc($_GET['b2_lat']) . ' AND lng <= ' . db_esc($_GET['b1_lng']) . ' AND lng >= ' . db_esc($_GET['b2_lng']) . ' ';
			$c = 'lat <= ' . db_esc($_GET['b1_lat']) . ' AND lat >= ' . db_esc($_GET['b2_lat']) . ' AND lng <= ' . db_esc($_GET['b1_lng']) . ' AND lng >= ' . db_esc($_GET['b2_lng']) . ' ';

			if(isset($_GET['b3_lat']) && is_numeric($_GET['b3_lat']) &&
			   isset($_GET['b3_lng']) && is_numeric($_GET['b3_lng']) &&
			   isset($_GET['b4_lat']) && is_numeric($_GET['b4_lat']) &&
			   isset($_GET['b4_lng']) && is_numeric($_GET['b4_lng'])) {

				//$c .= ' AND lat > ' . db_esc($_GET['b3_lat']) . ' AND lat < ' . db_esc($_GET['b4_lat']) . ' AND lng > ' . db_esc($_GET['b3_lng']) . ' AND lng < ' . db_esc($_GET['b4_lng']) . ' ';
				$c .= ' AND lat > ' . db_esc($_GET['b3_lat']) . ' AND lat < ' . db_esc($_GET['b4_lat']) . ' AND lng > ' . db_esc($_GET['b4_lng']) . ' AND lng < ' . db_esc($_GET['b3_lng']) . ' ';

			}

			$res = db_exec_all('SELECT id, name, lat, lng FROM companies WHERE ' . $c/* . ' AND id_owner != "' . __get_user_id_form_utk() . '"'*/);

			echo json_encode($res);

		}else {
			err(4);
		}

	}

?>