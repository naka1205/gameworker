<?php
namespace Code;
class Pdk{
        public static $maps = [];
        public static $rooms = [];
        public static $states = [];
        public $room_id;
        public $state;
        public $poker = [];
        public $plays = [];
        public $config = [];
        public $current_num = 0;   //当前出牌玩家
        public $last_win = 0;         //上一把赢家 
        public $last_handnum = 0;               //上一把出牌玩家  
        public $last_handpoker = [];            //上一把牌
        public $last_handpoker_type = [];  //上一把牌型

        public function __construct( $config,$room_id,$plays )
        {

                $this->config = $config;
                $this->room_id = $room_id;
                $this->plays = $plays;
                self::$rooms[] = $room_id;
                
                $this->last_win = 1;
        }

        //初始化
        public function init()
        {

                $this->poker = [];
                $this->landlord_poker = [];

                for ($i=1; $i <= 54; $i++) { 
                    //去掉大小王、1个A、3个2
                    if (  $i == 1 || $i == 2 ||  $i == 28 ||  $i == 41 ||  $i == 53 ||  $i == 54  ) {
                        continue;
                    }
                    $this->poker[] = $i;
                }
                foreach ($this->plays as $key => $value) {
                        $this->plays[$key]['poker'] = [];
                }

        }

        //发牌
        public function dealing()
        {
                var_dump('Game::dealing');
                var_dump($this->plays);
                shuffle($this->poker);

                foreach ( $this->poker as $key => $value) {
                        if ( count($this->plays[1]['poker']) < 16 ) {
                                $this->plays[1]['poker'][] = $value;
                        }else if ( count($this->plays[2]['poker']) < 16 ) {
                                $this->plays[2]['poker'][] = $value;
                        }else if ( count($this->plays[3]['poker']) < 16 ) {
                                $this->plays[3]['poker'][] = $value;
                        }
                }

        }
      
        //出牌
        public function play($seat,$poker_type)
        {
                var_dump('Game::play');
                if ( $this->last_handnum != 0 && $this->last_handnum != $seat) {
                        var_dump('Game::last_handnum != 0 ');
                        var_dump($this->plays[$seat]['poker']);
                        //与该轮出的最后一手牌比较
                        $poker_weight = Poker::$types[$poker_type['type']]['weight'];
                        $last_poker_weight = Poker::$types[$this->last_handpoker_type['type']]['weight'];
                        if ( $poker_weight > $last_poker_weight ) {

                            $this->plays[$seat]['poker'] =  array_diff ( $this->plays[$seat]['poker']  ,  $this->last_handpoker );
                            $this->last_handpoker_type =  $poker_type;
                            $this->last_handnum =  $seat;
                            var_dump($this->plays[$seat]['poker']);
                            return true;//当前牌型可以压前一手牌型
                        }
                        else if ( $poker_weight == $last_poker_weight ) {//当前牌型不可以压前一手牌型
                                if ( $poker_type['type'] == $this->last_handpoker_type['type'] && $poker_type['length'] == $this->last_handpoker_type['length'] ) {//牌型与出牌数都相同

                                        if ( $poker_type['num'] >  $this->last_handpoker_type['num'] ){
                                                $this->plays[$seat]['poker'] =  array_diff ( $this->plays[$seat]['poker']  ,  $this->last_handpoker );
                                                $this->last_handpoker_type =  $poker_type;
                                                $this->last_handnum =  $seat;
                                                var_dump($this->plays[$seat]['poker']);
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
                // var_dump('Game::length');
                // var_dump($length );
                // var_dump($pokers );
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
                var_dump('Game::next');
                $this->current_num++;
                $this->current_num = $this->current_num >= 4 ? 1 : $this->current_num;
                var_dump($this->current_num);
                return $this->current_num;
        }  

        //结束
        public function over()
        {
            
        }  

}