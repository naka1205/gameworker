<?php
namespace Controller;

use Lib\App;

class Index
{

	function test(){
		echo CONFIG_PATH;
	}

	function guest(){

		$account = 'guest_' . App::$post['account'];
		$password = md5( $account . App::$key );

		$result = [
			'status' => true,
			'account' => $account,
			'password' => $password
		];
		return $result;	                


	}

	function register(){

		$account = App::$post['account'];
		$password = App::$post['password'];
		$name = App::$post['name'];

		$data = [
			'account'=>$account,
			'password'=>$password,
			'name'=>$name,
			'create_time'=>time()
		];

		$uid = App::$db->insert('too_users')->cols($data)->query();

		$data['uid'] = $uid;
		$data['golds'] = 0;

		$string = $data['uid'] . '|' . $data['name'] . '|' . time();
		$auth = aencrypt($string);

		$result = [
			'status' => true,
			'auth' => $auth,
			'user' => $data
		];
		return $result;	                


	}

	function login(){

		$result = [
			'status' => false,
			'user' => ''
		];

		$account = App::$post['account'];
		$password = App::$post['password'];

		$data = [
			'account'=>$account
		];

		$user = App::$db->select('*')->from('too_users')->where('account= :account')->bindValues($data)->row();
		
		if ( $user['password'] == $password ) {

			$string = $user['uid'] . '|' . $user['name'] . '|' . time();
			$auth = aencrypt($string);

			$result = [
				'status' => true,
				'auth' => $auth,
				'user' => $user
			];
		}
		
		return $result;	    
	}

}
