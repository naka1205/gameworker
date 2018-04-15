<?php
namespace Controller;
use GatewayClient\Gateway;

class Common
{
             public $uid;
             public $name;
	public function __construct()
	{

                        if ( isset($_SERVER['HTTP_AUTH']) ) {
                                $auth = $_SERVER['HTTP_AUTH'];
                                $string = aencrypt($auth,'D');
                                $user = explode('|', $string);
                                $this->uid = $user[0];
                                $this->name = $user[1];
                        }
                        
	}

}
