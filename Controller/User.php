<?php
namespace Controller;

use Lib\App;
use GatewayClient\Gateway;

class User extends  Common
{
 
	function bind(){
		$result = [
			'status' => false,
			'uid' => ''
		];

		$client_id = App::$post['client_id'];

		$values = [
			'uid'=>$this->uid;
		];

		$user = App::$db->select('*')->from('too_users')->where('uid= :uid')->bindValues($values)->row();		

		Gateway::bindUid($client_id, $user['uid']);

		$result = [
			'status' => true,
			'uid' => $uid
		];
		return $result;		

	}

	function status(){
		
		$account = App::$post['account'];
		$password = App::$post['password'];

		$data = [
			'account'=>$account
		];

		$user = App::$db->select('*')->from('too_users')->where('account= :account')->bindValues($data)->row();

		$result = [
			'status' => true,
			'user' => $user
		];
		return $result;	    
	}

}
