<?php
namespace Code;
use \GatewayWorker\Lib\Gateway;

class Room{
             public static $maps = [];
             public static $clients = [];

	public static function isReady($roomid)
	{
                        $where = [
                                'roomid'=>$roomid,
                                'status'=>0
                        ];
                        $rooms = Common::$db->select('*')->from('too_rooms')->where('roomid= :roomid AND status = :status')->bindValues($where)->row();
                        $clients = json_decode($rooms['clients'],true);
                        foreach ($clients as $key => $value) {
                                if ( $value['uid'] <= 0 || !Gateway::isUidOnline($value['uid'])) {
                                        return false;
                                }
                        }
                        return true;
	}      

	public static function config($roomid)
	{
                        $where = [
                                'roomid'=>$roomid,
                                'status'=>0
                        ];
                        $rooms = Common::$db->select('config')->from('too_rooms')->where('roomid= :roomid AND status = :status')->bindValues($where)->row();
                        if ( $rooms['config'] ) {
                                return json_decode($rooms['config'],true);
                        }
                        return [];		
	} 

 
	public static function seat($uid)
	{

		return false;
	}  


}