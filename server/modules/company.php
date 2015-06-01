<?php

	function company_get_info() {

		echo json_encode( db_exec_first("SELECT id_owner, name, lat, lng FROM companies WHERE id='" . db_esc( $_GET['i'] ) . "'") );

	}

?>