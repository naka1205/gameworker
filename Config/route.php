<?php
/* 
 * 路由配置文件
 */  
use Lib\Route;

Route::get('demo', 'app\Index@demo');
Route::get('goods/(:num)', 'app\api@goods');

Route::error(function() {
  echo '404 :: Not Found';
});