<?php
/* 
 * 日志配置文件 
 */ 
return [

	'time_format'   =>  ' c ',
	'file_size'         =>  2097152,		  // 日志文件大小
	'file_path'        =>  LOG_PATH,		  // 日志保存目录
	'type'		 =>  ['error','debug','info','log'] //'error','debug','info','log'

];