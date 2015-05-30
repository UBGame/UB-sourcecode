<?php
	
	$debug = true;

	function in_debug_mode() {
		global $debug;
		return $debug;
	}

	/*if( $debug ) {
		ini_set( "display_errors", "1" );
		error_reporting( E_ALL & ~E_NOTICE );
	} else {
		error_reporting( 0 );
	}*/

	/* REQUIRE MODULES */
	require_once("modules/utils.php");
	require_once("modules/db.php");
	require_once("modules/user.php");

	if( $_GET['api_call_action'] ) {

		if( addslashes($_GET['api_call_action']) == $_GET['api_call_action'] ) {

			if(function_exists($_GET['api_call_action'])){
				
				hrc(200);

				$_GET['api_call_action']();
			
			} else {

				err(1, 'a');

			}

		} else {

			err(1);

		}

	}


?>