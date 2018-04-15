<?php
namespace Controller;

use Lib\App;
use GatewayClient\Gateway;

class Room extends  Common
{
 
	//生成房间编号
	function roomid()
	{
		$roomid = randNum();

		$data = [
			'roomid'=>$roomid,
			'status'=>1
		];

		$rooms = App::$db->select('*')->from('too_rooms')->where('roomid= :roomid AND status = :status')->bindValues($data)->row();

		if ( !$rooms  ) {
			return $roomid;
		}

		return $this->roomid();
	}

	//创建房间
	function create()
	{

		$result = [
			'status' => false,
			'rooms' => ''
		];

		$uid = $this->uid;
		$config = App::$post;

		$roomid = $this->roomid();
 		

		$data = [
			'create_id'=>$uid,
			'config'=>json_encode($config),
			'roomid'=>$roomid,
			'create_time'=>time()
		];

		$clients = [];
		for ( $i=1; $i <= 3; $i++ ) { 
			$clients[$i] = [
				'seat' => $i,
				'uid' => 0,
				'name' => ''
			];
		}
		$data['clients'] = json_encode($clients);
		$rid = App::$db->insert('too_rooms')->cols($data)->query();

		if ( $rid ){
			
			$cols = [
				'roomid'=>$roomid,
				'update_time'=>time()
			];

			App::$db->update('too_users')->cols($cols)->where("uid=$uid")->query();

			$result = [
				'status' => true,
				'rooms' => $data
			];
		}
	
		return $result;     
	}

	function check()
	{
		$result = [
			'status' => false,
			'rooms' => ''
		];

		$uid = $this->uid;
		$roomid = App::$post['roomid'];

 		$where = [
			'roomid'=>$roomid,
			'status'=>0
		];

		$rooms = App::$db->select('*')->from('too_rooms')->where('roomid= :roomid AND status = :status')->bindValues($where)->row();

		if ( $rooms ) {
			$result = [
				'status' => true,
				'rooms' => $rooms
			];
		}

		return $result;
	}

	//进入房间
	function join()
	{

		$result = [
			'status' => false,
			'clients' => ''
		];

		$uid = $this->uid;
		$name = $this->name;
		$roomid = App::$post['roomid'];

 		$where = [
			'roomid'=>$roomid,
			'status'=>0
		];
		$rooms = App::$db->select('*')->from('too_rooms')->where('roomid= :roomid AND status = :status')->bindValues($where)->row();

		$clients = json_decode($rooms['clients'],true);
		$seat = 0;

		for ( $i=1; $i <= 3; $i++ ) { 
			if ( $clients[$i]['uid'] == 0 || $clients[$i]['uid'] == $uid ) {
				$clients[$i]['uid'] = $uid;
				$clients[$i]['name'] = $name;
				$seat = $i;
				break;
			}
		}

		if ( $seat ){
			$cols = [
				'clients'=>json_encode($clients),
				'update_time'=>time()
			];

			$bool = App::$db->update('too_rooms')->cols($cols)->where('roomid= :roomid AND status = :status')->bindValues($where)->query();

			$client_ids = Gateway::getClientIdByUid($uid);

			if ( isset($client_ids[0]) ) {

				$cols = [
					'roomid'=>$roomid
				];

				App::$db->update('too_users')->cols($cols)->where("uid=$uid")->query();

				$client_id = $client_ids[0];

				$session = Gateway::getSession($client_id);

				$session['roomid'] =$roomid;
				$session['seat'] =$seat;
				Gateway::updateSession($client_id, $session );

				$result = [
					'status' => true,
					'clients' => $clients
				];
			}

		}
	
		return $result;     
	}

}
