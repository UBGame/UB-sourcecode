<?php

	function branch_create() {

		if( isset($_GET['n']) && !empty($_GET['n']) && strip_tags($_GET['n']) == $_GET['n'] && isset($_GET['lat']) && !empty($_GET['lat']) && isset($_GET['lng']) && !empty($_GET['lng']) ) {

			$c = db_exec_first("SELECT id FROM branches WHERE name='" . db_esc($_GET['n']) . "'");
			if(!$c) {

				$cid = db_exec_first('SELECT id_active_company FROM users WHERE username="' . __get_utk_stored_username() . '" AND token="' . __get_utk_stored_token() . '"');

				if($cid) {
					db_exec("INSERT INTO branches VALUES ('', " . $cid['id_active_company'] . ", 0, '" . db_esc($_GET['n']) . "', " . db_esc($_GET['lat']) . ", " . db_esc($_GET['lng']) . ", 0, 0)");
				}else
					err(0);

			}else {

				echo json_encode(['err' => 103]);

			}

		}else {
			if(empty($_GET['n']))
				echo json_encode(['err' => 102]);
			else
				err(4);
		}

	}

?>