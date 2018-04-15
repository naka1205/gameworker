<?php
namespace Code;
class Game{
        public static $maps = [];
        public static $rooms = [];
        public static $states = [];
        public $room_id;
        public $state;
        public $poker = [];
        public $plays = [];
        public $config = [];
        public $max_score;//抢牌最高分
        public $grab_time; //抢牌次数
        public $landlord_num;//地主编号
        public $landlord_poker = [];//地主扑克
        public $dealer_num = 0;
        public $last_poker = [];
        public $last_handpoker = [];
        public $last_handnum = 0;
        public $last_handpoker_type = [];

        public function __construct( $config,$room_id,$plays )
        {

                $this->config = $config;
                $this->room_id = $room_id;
                $this->plays = $plays;
                self::$rooms[] = $room_id;
                
        }

        //初始化
        public function init()
        {
                $this->grab_time = 0;
                $this->landlord_num = 0;
                $this->max_score = 0;
                $this->poker = [];
                $this->landlord_poker = [];

                for ($i=1; $i <= 54; $i++) { 
                    $this->poker[] = $i;
                }

                foreach ($this->plays as $key => &$value) {
                        $this->plays[$key]['poker'] = [];
                }

        }

        //发牌
        public function dealing()
        {
                var_dump('Game::dealing');
                shuffle($this->poker);

                foreach ( $this->poker as $key => $value) {
                        if ( count( $this->landlord_poker ) < 3 ) {
                                $this->landlord_poker[] = $value;
                        }else if ( count($this->plays[1]['poker']) < 17 ) {
                                $this->plays[1]['poker'][] = $value;
                        }else if ( count($this->plays[2]['poker']) < 17 ) {
                                $this->plays[2]['poker'][] = $value;
                        }else if ( count($this->plays[3]['poker']) < 17 ) {
                                $this->plays[3]['poker'][] = $value;
                        }
                }

        }

        //抢地主
        public function landlord($seat,$score)
        {
                var_dump('Game::landlord');
                
                $score = intval($score);
                if ( $this->max_score >= $score || $this->grab_time >= 3 ) {
                        $this->grab_time++;
                        return false;
                }

                $this->max_score = $score;
                $this->grab_time++;


                $this->plays[$seat]['score'] = $score;

                foreach ($this->landlord_poker as $key => $value) {
                        $this->plays[$seat]['poker'][] = $value;
                }
                $this->landlord_num = $seat;

                // foreach ( $this->plays as $key => $value ) {
                //         if ( $key == $seat) {
                //                 $this->plays[$key]['score'] = $score;

                //                 foreach ($this->landlord_poker as $key => $value) {
                //                         $this->plays[$key]['poker'][] = $value;
                //                 }
                //                 $this->landlord_num = $key;
                //         }else{
                //                 $this->plays[$key]['score'] = $this->plays[$key]['score'] > 0 ? $this->plays[$key]['score'] : 0;
                //         }
                // }
                
                return true;

        }        
        //出牌
        public function play($seat,$poker_type)
        {
                var_dump('Game::play');
                if ( $this->last_handnum != 0 ) {
                        var_dump('Game::last_handnum != 0 ');
                        var_dump($this->last_handnum);
                        //与该轮出的最后一手牌比较
                        $poker_weight = Poker::$types[$poker_type['type']]['weight'];
                        $last_poker_weight = Poker::$types[$this->last_handpoker_type['type']]['weight'];
                        if ( $poker_weight > $last_poker_weight ) {

                            $this->plays[$seat]['poker'] =  array_diff ( $this->plays[$seat]['poker']  ,  $this->last_handpoker );
                            $this->last_handpoker_type =  $poker_type;
                            $this->last_handnum =  $seat;
                            return true;//当前牌型可以压前一手牌型
                        }
                        else if ( $poker_weight == $last_poker_weight ) {//当前牌型不可以压前一手牌型
                                if ( $poker_type['type'] == $this->last_handpoker_type['type'] && $poker_type['length'] == $this->last_handpoker_type['length'] ) {//牌型与出牌数都相同

                                        if ( $poker_type['num'] >  $this->last_handpoker_type['num'] ){
                                                $this->plays[$seat]['poker'] =  array_diff ( $this->plays[$seat]['poker']  ,  $this->last_handpoker );
                                                $this->last_handpoker_type =  $poker_type;
                                                $this->last_handnum =  $seat;
                                                return true;//数值大的压数值小的
                                        }
                                        else return false;
                                } else return false;
                        } else return false;

                }
                var_dump('Game::last_handnum');
                var_dump($this->last_handnum);
                // var_dump($this->plays[$seat]['poker']);
                $this->plays[$seat]['poker'] =  array_diff ( $this->plays[$seat]['poker']  ,  $this->last_handpoker );
                // var_dump($this->plays[$seat]['poker']);
                $this->last_handpoker_type =  $poker_type;
                $this->last_handnum =  $seat;
                return true; 

        } 
        //检测
        public function check($seat,$pokers)
        {
                var_dump('Game::check');

                $length = 0;
                $pokers_nums = [];

                foreach ($pokers as $key => $value) {

                        if ( in_array($value, $this->plays[$seat]['poker']  )) {
                                $length++;
                                $pokers_nums[] = Poker::$maps[$value];
                        }
                        
                }
                var_dump('Game::length');
                var_dump($length );
                var_dump($pokers );
                if ( $length != count($pokers) ) {
                     return false;
                }

                $this->last_handpoker = $pokers;

                $type = Poker::getType($pokers_nums);
                var_dump('Game::type');
                var_dump($type );
                if ( $type == null) {
                     return false;
                }
                return $type;
        } 

        //下一位
        public function next()
        {
                $this->dealer_num++;
                $this->dealer_num = $this->dealer_num >= 4 ? 1 : $this->dealer_num;

                

                return $this->dealer_num;
        }  

        //结束
        public function over()
        {
            
        }  

        public static function room($roomid)
        {
                if (  isset(Game::$maps[$roomid]) ) {
                        return Game::$maps[$roomid];
                }
                return false;
        }  

        public static function seat($client_id)
        {
                if (  isset(Game::$maps[$roomid]) ) {
                        return Game::$maps[$roomid];
                }
                return false;
        }  

}