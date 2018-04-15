<?php
namespace Lib;
/**
 * 日志处理
 */
class Log {

	protected static $config  = [];


	public static function init($config = [])
	{
		if (!empty($config)) {
			self::$config = array_merge(self::$config, $config); 
		}

	}

 
	public static function write($log,$type = 'log',$file_path = '') {

	    	$config = config('log');
	    	self::init($config);

	    	if ( !in_array($type, self::$config['type']) ) {
	    		return false;
	    	}

	    	$now = date(self::$config['time_format']);

	    	if(empty($file_path))
	    		$file_path = self::$config['file_path'].date('y_m_d').'.log';

	    	$log_dir = dirname($file_path);
	    	if (!is_dir($log_dir)) {
	    		mkdir($log_dir, 0755, true);
	    	}        

	    	if(is_file($file_path) && floor(self::$config['file_size']) <= filesize($file_path) )
	    		rename($file_path,dirname($file_path).'/'.time().'-'.basename($file_path));    

	    	$info = "[{$type}][{$now}] ";
	    	if ( IS_CLI ) {
	    		$info .= ' CLI ';
	    	}else{
	    		$info .=  $_SERVER['REMOTE_ADDR'].' '.$_SERVER['REQUEST_URI'];
	    	}

	    	error_log($info."\r\n" . var_export($log,true) . "\r\n", 3,$file_path);
	    	return true;
	}


}