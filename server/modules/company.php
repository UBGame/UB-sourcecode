<?php

	function company_get_info() { 

		if(isset($_GET['i'])) {
			echo json_encode(db_exec_all("SELECT id, id_company, name AS 'branch_name', lat, lng, type FROM branches WHERE id_company='" . db_esc($_GET['i']) . "'" . ( isset($_GET['b']) && $_GET['b'] ? "" : " AND type = '1'" )));
		}else if(isset($_GET['n'])) {
			$hq = db_exec_first("SELECT id, id_company, name AS 'branch_name', lat, lng, type FROM branches WHERE name='" . db_esc($_GET['n']) . "' AND type='1'");
			$res = [];
			if(isset($_GET['b']) && $_GET['b']) {
				$res = db_exec_all("SELECT id, id_company, name AS 'branch_name', lat, lng, type FROM branches WHERE id_company='" . $hq['id_company'] . "' AND type!='1'");
			}

			$res[] = $hq;

			echo json_encode( $res );

		}else
			err(4);

	}

	function company_create() {

		if( isset($_GET['n']) && !empty($_GET['n']) && strip_tags($_GET['n']) == $_GET['n'] && isset($_GET['lat']) && !empty($_GET['lat']) && isset($_GET['lng']) && !empty($_GET['lng']) ) {

			$c = db_exec_first("SELECT id FROM companies WHERE name='" . db_esc($_GET['n']) . "'");
			if(!$c) {

				db_exec("INSERT INTO branches VALUES ('', '', 1, '" . db_esc($_GET['n']) . "', '" . db_esc($_GET['lat']) . "', '" . db_esc($_GET['lng']) . "', 0, 0)");

				$hq = db_exec_first('SELECT id FROM branches WHERE name="' . db_esc($_GET['n']) . '"');

				db_exec("INSERT INTO companies VALUES ('', " . __get_user_id_form_utk() . ", " . $hq['id'] . ", '" . db_esc($_GET['n']) . "')");

				$c = db_exec_first("SELECT id FROM companies WHERE name ='" . db_esc($_GET['n']) . "'");

				db_exec('UPDATE branches SET id_company="' . $c['id'] . '" WHERE name="' . db_esc($_GET['n']) . '"');

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
			$c = 'c.lat <= ' . db_esc($_GET['b1_lat']) . ' AND c.lat >= ' . db_esc($_GET['b2_lat']) . ' AND c.lng <= ' . db_esc($_GET['b1_lng']) . ' AND c.lng >= ' . db_esc($_GET['b2_lng']) . ' ';

			if(isset($_GET['b3_lat']) && is_numeric($_GET['b3_lat']) &&
			   isset($_GET['b3_lng']) && is_numeric($_GET['b3_lng']) &&
			   isset($_GET['b4_lat']) && is_numeric($_GET['b4_lat']) &&
			   isset($_GET['b4_lng']) && is_numeric($_GET['b4_lng'])) {

				//$c .= ' AND lat > ' . db_esc($_GET['b3_lat']) . ' AND lat < ' . db_esc($_GET['b4_lat']) . ' AND lng > ' . db_esc($_GET['b3_lng']) . ' AND lng < ' . db_esc($_GET['b4_lng']) . ' ';
				$c .= ' AND c.lat > ' . db_esc($_GET['b3_lat']) . ' AND c.lat < ' . db_esc($_GET['b4_lat']) . ' AND c.lng > ' . db_esc($_GET['b4_lng']) . ' AND c.lng < ' . db_esc($_GET['b3_lng']) . ' ';

			}

			$res = db_exec_all("SELECT b.id, c.name AS 'company_name', b.name AS 'branch_name', b.lat, b.lng, b.type FROM companies c, branches b WHERE b.id_company = c.id AND " . str_replace('c.', 'b.', $c) . "" . ( isset($_GET['b']) && $_GET['b'] ? "" : " AND type='1'" ));

			echo json_encode( $res );

		}else {
			err(4);
		}

	}

	function company_get_branches() {
		if(isset($_GET['i'])) {
			$f = 'lat, lng';
			if(isset($_GET['f'])) $f = db_esc($_GET['f']);
			echo json_encode( db_exec_all("SELECT id, id_company, name AS 'branch_name', " . $f . " FROM branches WHERE id_company='" . db_esc($_GET['i']) . "' AND type!='1'") );
		}else
			err(4);
	}

?>