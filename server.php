<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/Lib/functions.php';

$mysql = require_once __DIR__ . '/Config/mysql.php';

use Workerman\Worker;
use Workerman\Protocols\Http;
use Workerman\MySQL\Connection as DB;
use GatewayClient\Gateway;
use Lib\App;




$worker = new Worker('http://127.0.0.1:4321');	//上线改为外网IP

$worker->name = 'ApiServers';

Gateway::$registerAddress = '127.0.0.1:1234';

$worker->onWorkerStart = function($worker)
{
	global $mysql;
	$config = $mysql['ddz'];
	App::$db = new DB($config['host'], $config['port'], $config['uname'], $config['pwd'], $config['dbname']);

};
$worker->onMessage = function($connection, $data)
{

	try {
		App::$connection = $connection;

		App::run();


	} catch (\Exception $e) {
		// create http response header
		switch ($e->getCode()) {
			case 404:
				$header = 'HTTP/1.1 404 Not Found';
				$response = '404';
			break;
			default:
				$header = 'HTTP/1.1 500 Internal Server Error';
				$response = '500';
			break;
		}

		Http::header($header);
		$connection->send($response);
	}

};

Worker::runAll();