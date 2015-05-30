<?php

	$debug_only_errors = array(-1, 2);
	$banned_from_messages = array(-1, 2);

	function hrc($c) { http_response_code($c); }
	
	function err($err_no, $msg = '') {

		global $debug_only_errors;
		global $banned_from_messages;

		hrc(400);

		$err_msg = array();
		
		if($msg && ( in_debug_mode() || (!in_debug_mode() && !in_array($err_no, $banned_from_messages)) ))
			$err_msg['m'] = $msg;

		if(!in_debug_mode() && in_array($err_no, $debug_only_errors))
			$err_no = 0;

		$err_msg['n'] = $err_no;

		echo json_encode($err_msg);

		die();
	}

?>