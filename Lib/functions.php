<?php


function config($name)
{
	$file =  CONFIG_PATH . $name . '.php';

	$config = [];
	if ( is_file($file) ) {
		$config = require $file;
	}  

	return $config;
}


function getName()
{
	$a = ["上官","欧阳","东方","端木","独孤","司马","南宫","夏侯","诸葛","皇甫","长孙","宇文","轩辕","东郭","子车","东阳","子言",];

	$b = ["雀圣","赌侠","赌圣","稳赢","不输","好运","自摸","有钱","土豪",];

	return $a;
}


function randNum($length = 6) {
	return rand(pow(10,($length-1)), pow(10,$length)-1);
}


function aencrypt($string = '',$operation = 'E',$key='')
{
	// $default = config('default',true);
	// 密匙
	$key = md5($key ? $key : 'ddz'); // AUTH_KEY 项目配置的密钥

	$key_length = strlen($key);
	$string = $operation == 'D' ? base64_decode($string) : substr(md5($string.$key),0,8).$string;
	$string_length = strlen($string);
	$rndkey = $box = [];
	$result = '';
	for( $i = 0; $i <= 255; $i++ )
	{
		$rndkey[$i] = ord($key[$i%$key_length]);
		$box[$i] = $i;
	}
	for( $j = $i = 0; $i < 256; $i++ )
	{
		$j = ($j+$box[$i]+$rndkey[$i]) % 256;
		$tmp = $box[$i];
		$box[$i] = $box[$j];
		$box[$j] = $tmp;
	}
	for( $a = $j = $i =0; $i < $string_length; $i++ )
	{
		$a = ($a + 1) % 256;
		$j = ($j + $box[$a]) % 256;
		$tmp = $box[$a];
		$box[$a] = $box[$j];
		$box[$j] = $tmp;
		$result .= chr(ord($string[$i])^($box[($box[$a] + $box[$j]) % 256]));
	}
	if( $operation == 'D' )
	{
		if( substr($result,0,8) == substr(md5(substr($result,8).$key),0,8) )
		{
			return substr($result,8);
		}
		else
		{
			return'';
		}
	}
	else
	{
		return str_replace('=','',base64_encode($result));
	}
}
