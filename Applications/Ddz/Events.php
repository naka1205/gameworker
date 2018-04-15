<?php
/**
* This file is part of workerman.
*
* Licensed under The MIT License
* For full copyright and license information, please see the MIT-LICENSE.txt
* Redistributions of files must retain the above copyright notice.
*
* @author walkor<walkor@workerman.net>
* @copyright walkor<walkor@workerman.net>
* @link http://www.workerman.net/
* @license http://www.opensource.org/licenses/mit-license.php MIT License
*/

/**
* 用于检测业务代码死循环或者长时间阻塞等问题
* 如果发现业务卡死，可以将下面declare打开（去掉//注释），并执行php start.php reload
* 然后观察一段时间workerman.log看是否有process_timeout异常
*/
//declare(ticks=1);

/**
* 聊天主逻辑
* 主要是处理 onMessage onClose 
*/
use \GatewayWorker\Lib\Gateway;
use \Workerman\MySQL\Connection as DB;
use \Code\Common;
use \Code\Room;
use \Code\Game;

class Events
{

	

	public static function onWorkerStart($worker)
	{
		global $mysql;
		$config = $mysql['ddz'];
		Common::$db = new DB($config['host'], $config['port'], $config['uname'], $config['pwd'], $config['dbname']);
	}

	public static function onConnect($client_id)
	{
		// debug
		echo "client:onConnect"."\n";
		Gateway::sendToClient($client_id, json_encode(array(
			'type'      => 'init',
			'client_id' => $client_id
		)));
	}

	/**
	* 有消息时
	* @param int $client_id
	* @param mixed $message
	*/
	public static function onMessage($client_id, $message)
	{
		// debug
		// echo "client:{$_SERVER['REMOTE_ADDR']}:{$_SERVER['REMOTE_PORT']} gateway:{$_SERVER['GATEWAY_ADDR']}:{$_SERVER['GATEWAY_PORT']}  client_id:$client_id session:".json_encode($_SESSION)." onMessage:".$message."\n";

		// 客户端传递的是json数据
		$message_data = json_decode($message, true);
		if(!$message_data)
		{
			return ;
		}
		// var_dump($message_data);
		// 根据类型执行不同的业务
		switch($message_data['type'])
		{
			//回应服务端的心跳
			case 'pong':
				return;
			// 登录 
			case 'login':

				if(!isset($message_data['auth']))
				{
					throw new \Exception("\$message_data['auth'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message");
				}

				$string = Common::aencrypt($message_data['auth'],'D');
				if ( empty($string) ) {
					return;
				}
				$auth = explode('|', $string);

				$uid = $auth[0];
				$name = $auth[1];
				// uid用session存储起来，避免重复绑定
				$_SESSION['uid'] = $uid;
				$_SESSION['name'] = $name;

				// 绑定uid
				Gateway::bindUid($client_id, $uid);
				$new_message = [
					'type'=>$message_data['type'], 
					'client_id'=>$client_id, 
					'time'=>date('Y-m-d H:i:s')
				];
				Gateway::sendToCurrentClient(json_encode($new_message));

				return;
			// 加入房间
			case 'join':

				// 判断是否有房间号
				if(!isset($_SESSION['roomid']))
				{
					throw new \Exception("\$_SESSION['roomid'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message");
				}   

				$uid = $_SESSION['uid'];
				$name = $_SESSION['name'];
				$seat = $_SESSION['seat'];
				$roomid = $_SESSION['roomid'];

				$config = Room::config($roomid);

				// 获取房间内所有用户列表 
				$clients = Gateway::getClientSessionsByGroup($roomid);  
				// 发送给当前用户发送用户列表
				$new_message = [
					'type'=>$message_data['type'], 
					'uid'=>$uid, 
					'seat'=>$seat, 
					'name'=>$name, 
					'time'=>date('Y-m-d H:i:s')
				];

				

				Gateway::sendToGroup($roomid, json_encode($new_message));
				Gateway::joinGroup($client_id, $roomid);

				$clients = Gateway::getClientSessionsByGroup($roomid); 
				$clients_list = [];

				foreach ($clients as $key => $value) {
					$seat = intval($value['seat']) ;
					$clients_list[$seat] = $value;
				}

				$new_message['config'] = $config;
				$new_message['clients'] = $clients_list;

				Gateway::sendToCurrentClient(json_encode($new_message));

				$bool = Room::isReady($roomid);

				if ( $bool  ) {
					
					$game = new Game($config,$roomid,$clients_list);
					$game->init();
					$game->dealing(); 

					Room::$maps[] = $roomid;
					Game::$maps[$roomid] = $game;
					foreach ( $game->plays as $key => $value) {

						$begin_message = [
							'type' => 'begin',
							'seat' => $value['seat'],
							'name' => $value['name'],
							'poker' => $value['poker'], 
							'time' => date('Y-m-d H:i:s')
						];

						$client_ids = Gateway::getClientIdByUid( $value['uid'] );
						$client_id = $client_ids[0];
						Gateway::sendToClient( $client_id,  json_encode($begin_message)); 
					}

				}

				return;               
			//准备
			case 'ready':
				// 判断是否有房间号
				if(!isset($_SESSION['roomid']))
				{
					throw new \Exception("\$_SESSION['roomid'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message");
				}  

				$roomid = $_SESSION['roomid'];
				$seat = $_SESSION['seat'];
				$state = $_SESSION['state'] ? 0 : 1;

				$ready_message = [
					'type'=>'ready', 
					'seat'=>$seat,
					'state'=>$state,
					'time'=>date('Y-m-d H:i:s')
				];

				$_SESSION['state'] = $state;

				Gateway::sendToGroup($roomid, json_encode($ready_message));

				return ;
			//开始
			case 'begin':
				// 判断是否有房间号
				if(!isset($_SESSION['roomid']))
				{
					throw new \Exception("\$_SESSION['roomid'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message");
				}  

				$roomid = $_SESSION['roomid'];

				$clients = Gateway::getClientSessionsByGroup($roomid);
				// $game = new Game($roomid,$clients);
				// $game->init();
				// $game->dealing();

				Gateway::sendToGroup($roomid, json_encode($begin_message));

				return ;
			//抢地主
			case 'landlord':
				// 判断是否有房间号
				if(!isset($_SESSION['roomid']))
				{
					throw new \Exception("\$_SESSION['roomid'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message");
				}  

				$roomid = $_SESSION['roomid'];
				$seat = $_SESSION['seat'];
				$name = $_SESSION['name'];
				$score = $message_data['score'];

				// var_dump(Game::$maps[$roomid] );
				if ( !isset( Game::$maps[$roomid] ) ) {
					throw new \Exception("\self::$maps[$roomid] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message"); 
				}

				$game = Game::$maps[$roomid];

				$game->landlord($seat,$score);
				$new_message = [
					'type'=>'landlord', 
					'seat'=>$seat,
					'name'=>$name,
					'landlord_num'=>$game->landlord_num,
					'max_score'=>$game->max_score,
					'grab_time'=>$game->grab_time,
					'time'=>date('Y-m-d H:i:s')
				];
				if ( $game->max_score == 3 || $game->grab_time == 3 ) {
					$new_message['landlord_poker'] = $game->landlord_poker;
				}

				Gateway::sendToGroup($roomid, json_encode($new_message));

				return ;
						//抢地主
			case 'play':

				// 判断是否有房间号
				if(!isset($_SESSION['roomid']))
				{
					throw new \Exception("\$_SESSION['roomid'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message");
				}  

				$roomid = $_SESSION['roomid'];
				$seat = $_SESSION['seat'];
				$name = $_SESSION['name'];

				// var_dump(Game::$maps[$roomid] );
				if ( !isset( Game::$maps[$roomid] ) ) {
					throw new \Exception("\Game::$maps[$roomid] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message"); 
				}

				$game = Game::$maps[$roomid];

				if ( !isset( $message_data['pokers'] ) ) {
					throw new \Exception("\$message_data['pokers'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message"); 
				}

				
				$pokers = explode(',', $message_data['pokers']);
				$poker_type = $game->check($seat,$pokers);
				
				$new_message = [
					'type'=>'play', 
					'seat'=>$seat,
					'name'=>$name,
					'time'=>date('Y-m-d H:i:s')
				];

				if ( !$poker_type ) {
					Gateway::sendToCurrentClient(json_encode($new_message));
					return ;
				}

				$game->dealer_num = $seat;
				$bool = $game->play($seat,$poker_type);

				if ( !$bool ) {
					Gateway::sendToCurrentClient(json_encode($new_message));
					return ;
				}
				$new_message = [
					'type'=>'play', 
					'seat'=>$seat,
					'name'=>$name,
					'poker_type'=>$poker_type,
					'pokers'=>$pokers,
					'time'=>date('Y-m-d H:i:s')
				];

				Gateway::sendToGroup($roomid, json_encode($new_message));
				return ;

			case 'next':
				// 判断是否有房间号
				if(!isset($_SESSION['roomid']))
				{
					throw new \Exception("\$_SESSION['roomid'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message");
				}  

				$roomid = $_SESSION['roomid'];
				$seat = $_SESSION['seat'];
				$name = $_SESSION['name'];

				// var_dump(Game::$maps[$roomid] );
				if ( !isset( Game::$maps[$roomid] ) ) {
					throw new \Exception("\Game::$maps[$roomid] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message"); 
				}

				$game = Game::$maps[$roomid];
				
				$dealer_num = $game->next();

				// var_dump($dealer_num);
				if ( $dealer_num != $message_data['dealer_num'] ) {
					return ;
				}

				$new_message = [
					'type'=>'next', 
					'seat'=>$seat,
					'name'=>$name,
					'dealer_num'=>$dealer_num,
					'time'=>date('Y-m-d H:i:s')
				];

				Gateway::sendToGroup($roomid, json_encode($new_message));
				return ;

			//退出
			case 'logout':
				// 判断是否有房间号
				if(!isset($_SESSION['roomid']))
				{
					throw new \Exception("\$_SESSION['roomid'] not set. client_ip:{$_SERVER['REMOTE_ADDR']} \$message:$message");
				}  

				$roomid = $_SESSION['roomid'];


				Gateway::sendToGroup($roomid, json_encode($ready_message));

				return ;
		}

	}

	/**
	* 当客户端断开连接时
	* @param integer $client_id 客户端id
	*/
	public static function onClose($client_id)
	{
	// debug
		echo "client:{$_SERVER['REMOTE_ADDR']}:{$_SERVER['REMOTE_PORT']} gateway:{$_SERVER['GATEWAY_ADDR']}:{$_SERVER['GATEWAY_PORT']}  client_id:$client_id onClose:''\n";

	// 从房间的客户端列表中删除
		if(isset($_SESSION['roomid']))
		{
			$roomid = $_SESSION['roomid'];
			$new_message = array('type'=>'logout',  'seat'=>$_SESSION['seat'], 'client_id'=>$client_id, 'time'=>date('Y-m-d H:i:s'));
			Gateway::sendToGroup($roomid, json_encode($new_message));
		}
	}

}
