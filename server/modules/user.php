<?php

	$__token_cookie_garbage_size = 3;

	function __generate_garbage($size) {
		$seed = str_split('abcdefghijklmnopqrstuvwxyz'
		                 .'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		                 .'0123456789'); // and any other characters
		shuffle($seed); // probably optional since array_is randomized; this may be redundant
		$tc = '';
		foreach (array_rand($seed, $__token_cookie_garbage_size) as $k) $tc .= $seed[$k];
	}
	
	function __encode_token_cookie($token, $username) {

		$tc  = __generate_garbage($__token_cookie_garbage_size);
		$tc .= $token;
		$tc .= __generate_garbage($__token_cookie_garbage_size);
		$tc .= $username;
		return $tc;

	}
	function __generate_token() {
		return md5( __generate_garbage(3) . time() . __generate_garbage(3));
	}

	function user_get_token($bypass) {
		if($bypasss || user_is_logged_in()) {
			return substr($_COOKIE['user'], $__token_cookie_garbage_size, 32);
		}
	}

	function user_get_username() {
		if($bypasss || user_is_logged_in()) {
			return substr($_COOKIE['user'], $__token_cookie_garbage_size * 2 + 32);
		}
	}

	function user_is_logged_in() {
		if(isset($_COOKIE['user'])) {
			$user = db_exec_first("SELECT id FROM users WHERE username=" . $user_get_username . " AND token=" . user_get_token(true));
			if($user)
				return true;
			return false;
		} else
			return false;
	}

	function user_login() {

		if($_GET['u'] == $_GET['p'])
			echo 'same';
		else
			echo 'diff';

	}

?>