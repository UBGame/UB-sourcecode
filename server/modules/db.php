<?php

	$db = mysqli_connect('localhost', 'mariande_ub_root', 'ub_root', 'mariande_ultimate_business');

	if($db->connect_errno > 0){
		err(2, 'connection error');
	}

	function db_exec($q) {

		global $db;

		if(!$r = $db->query($q)){
			err(2, db_esc($q));
		} else {
			return $r;
		}
	}

	function db_exec_first($q) {
		return db_exec($q)->fetch_assoc();
	}

	function db_esc($s) { global $db; return $db->escape_string($s); }

?>