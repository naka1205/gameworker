<?php
namespace Lib;

use Workerman\Protocols\Http;

class App {

	protected static $config  = [];
	public static $key  = 'ddz';

	public static $db  = null;
	public static $connection  = null;
	public static $post  = [];
	public static $request  = [];
	public static $users  = [];

	public static function run()
	{

		Http::header("Access-Control-Allow-Origin: *"); 
		Http::header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept,Auth');
		Http::header('Access-Control-Allow-Methods: GET, POST, PUT,OPTIONS');
		Http::header("Content-Type: application/json;charset=utf-8");

		Route::any('demo', 'Controller\Api@demo');
		Route::any('test', 'Controller\Index@test');
		
		Route::post('login', 'Controller\Index@login');
		Route::post('guest', 'Controller\Index@guest');
		Route::post('register', 'Controller\Index@register');
		Route::post('create', 'Controller\Room@create');
		Route::post('check', 'Controller\Room@check');
		Route::post('join', 'Controller\Room@join');

		Route::error(function()  {

			return;

		});

		App::$post = [];
		if (!empty($GLOBALS['HTTP_RAW_POST_DATA'])) {
			$raw_post = explode( '&', $GLOBALS['HTTP_RAW_POST_DATA']);
			$post = [];
			foreach ($raw_post as $key => $value) {
				$temp = explode( '=', $value);
				$post[$temp[0]] = $temp[1];
			}
			App::$post = $post;
		}

		App::$request = [];
		if (!empty($GLOBALS['HTTP_RAW_REQUEST_DATA'])) {
			$raw_request = explode( '&', $GLOBALS['HTTP_RAW_REQUEST_DATA']);
			$request = [];
			foreach ($raw_request as $key => $value) {
				$temp = explode( '=', $value);
				$request[$temp[0]] = $temp[1];
			}
			App::$request = $request;
		}
		
		$reslut = Route::dispatch(); 
		$response = is_array($reslut) ? json_encode($reslut) : $reslut;
		App::$connection->send($response);
		
	}

}