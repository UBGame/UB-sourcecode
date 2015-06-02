<?php

	$__token_cookie_garbage_size = 3;

	function __generate_garbage($size) {

		$seed = str_split('abcdefghijklmnopqrstuvwxyz'
		                 .'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		                 .'0123456789'); // and any other characters
		shuffle($seed); // probably optional since array_is randomized; this may be redundant
		$tc = '';

		foreach (array_rand($seed, $size) as $k) $tc .= $seed[$k];
		
		return $tc;
	}
	
	function __generate_utk($token, $username) {

		global $__token_cookie_garbage_size;

		$tc  = __generate_garbage($__token_cookie_garbage_size);
		$tc .= $token;
		$tc .= __generate_garbage($__token_cookie_garbage_size);
		$tc .= $username;
		return $tc;

	}
	function __generate_token() {
		global $__token_cookie_garbage_size;
		return md5( __generate_garbage(3) . time() . __generate_garbage(3));
	}

	function __get_token($utk, $bypass = false) {
		global $__token_cookie_garbage_size;
		if($bypass) {
			return substr($utk, $__token_cookie_garbage_size, 32);
		}else if( __is_logged_in() ) {
			return substr($utk, $__token_cookie_garbage_size, 32);
		}
	}

	function __get_utk_stored_token($bypass = false) {
		return __get_token(__get_user_token(), $bypass);
	}

	function __get_username($utk, $bypass = false) {
		global $__token_cookie_garbage_size;
		if($bypass) {
			return substr($utk, $__token_cookie_garbage_size * 2 + 32);
		}else if(__is_logged_in()) {
			return substr($utk, $__token_cookie_garbage_size * 2 + 32);
		}
	}

	function __get_utk_stored_username($bypass = false) {
		return __get_username(__get_user_token(), $bypass);
	}

	function __get_user_id_form_utk() {
		return db_exec_first("SELECT id FROM users WHERE username='" . __get_utk_stored_username() . "'")['id'];
	}

	function __is_logged_in() {
		if(__get_user_token()) {
			$user = db_exec_first("SELECT id FROM users WHERE username='" . __get_utk_stored_username(true) . "' AND token='" . __get_utk_stored_token(true) . "'");
			if($user)
				return true;
			return false;
		} else
			return false;
	}

	function __get_user_token() {
		global $global_prefix;
		return isset($_COOKIE[ $global_prefix . 'utk' ]) && !empty($_COOKIE[ $global_prefix . 'utk' ]) ? $_COOKIE[ $global_prefix . 'utk' ] : false;
	}

	function user_is_logged_in() {
		echo json_encode( [ 'logged_in' => __is_logged_in() ] );
	}

	function user_login() {

		$user = db_exec_first("SELECT username FROM users WHERE username='" . db_esc($_GET['u']) . "' AND password='" . md5( db_esc($_GET['p']) ) . "'");

		if($user) {

			global $global_prefix;

			$tok = __generate_token();
			$utk = __generate_utk($tok, $user['username']);

			db_exec("UPDATE users SET token='" . $tok . "' WHERE username='" . $user['username'] . "'");

			setcookie($global_prefix . 'utk', $utk, ( time() + 24 * 60 * 60 ) );

		}else
			err(3);

	}

	function user_logout() {

		global $global_prefix;

		setcookie($global_prefix . 'utk', '', ( time() - 3600 ) );

	}

	function user_get_info() {

		$fields = 'id, firstname, lastname';

		if(isset($_GET['u']) && !empty($_GET['u']))
			$username = $_GET['u'];
		else if(__get_user_token()){
			$username = __get_utk_stored_username();
			$fields .= ', id_active_company';
		} else
			err(4);


		$result = db_exec_first("SELECT " . $fields . " FROM users WHERE username='" . db_esc($username) . "'");

		$result['username'] = $username;
		
		echo json_encode( $result );
	}

	function user_get_companies() {

		if(isset($_GET['i'])) {

			$result = db_exec("SELECT id, name, lat, lng FROM companies WHERE id_owner='" . db_esc($_GET['i']) . "'");

			$cp = array();

			while($row = $result->fetch_assoc())
				$cp[] = $row;

			echo json_encode($cp);

		}else {
			err(4);
		}

	}

	function user_set_active_company() {

		if(isset($_GET['i'])) {

			db_exec("UPDATE users SET id_active_company='" . db_esc($_GET['i']) . "' WHERE username='" . __get_utk_stored_username() . "'");

		}else {
			err(4);
		}

	}

?>