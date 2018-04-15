<?php
namespace Code;
class Poker {
    public static $types = [
         "1" => ['weight'=>1,'allNum'=>1,'minL'=>5,'maxL' => 12]
        ,"11" => ['weight'=>1,'allNum'=>2,'minL'=>3,'maxL' => 10]
        ,"111" => ['weight'=>1,'allNum'=>3,'minL'=>1,'maxL' => 6]
        ,"1111" => ['weight'=>2,'allNum'=>4,'minL'=>1,'maxL' => 1]
        ,"1112" => ['weight'=>1,'zcy'=>"111",'fcy'=>"1",'fcyNum'=>1,'allNum'=>4,'minL'=>1,'maxL' => 5]
        ,"11122" => ['weight'=>1,'zcy'=>"111",'fcy'=>"11",'fcyNum'=>1,'allNum'=>5,'minL'=>1,'maxL' => 4]
        ,"111123" => ['weight'=>1,'zcy'=>"1111",'fcy'=>"1",'fcyNum'=>2,'allNum'=>6,'minL'=>1,'maxL' => 1]
        ,"11112233" => ['weight'=>1,'zcy'=>"1111",'fcy'=>"11",'fcyNum'=>2,'allNum'=>8,'minL'=>1,'maxL' => 1]
        ,"12" => ['weight'=>3,'allNum'=>2,'minL'=>1,'maxL' => 1]
    ];

    public static $maps = [0,18,17,3,4,5,6,7,8,9,10,11,12,13,14,16,3,4,5,6,7,8,9,10,11,12,13,14,16,3,4,5,6,7,8,9,10,11,12,13,14,16,3,4,5,6,7,8,9,10,11,12,13,14,16];

    public function __construct() {
    }


    public static function isStraight($numbers) {
        var_dump('Poker::isStraight');
        for ($i = 1; $i < count($numbers); $i++) {
            if ($numbers[$i] - $numbers[$i - 1] != 1) {
                return false;
            }
        }
        return true;
    }


    public static function getType($pokers, $chaiNum = null) {
        var_dump('Poker::getType');
        if ($chaiNum == null) {
            $chaiNum = 3;
        }

        $splitPoker = Poker::SplitPoker($pokers, $chaiNum); //把牌拆成非组合类型
        var_dump($splitPoker);
        $pokerType  = ['type' => "", 'num' => 0, 'length' => count($pokers)];
        if (count($splitPoker["12"]) > 0) {
            if ($pokerType['length'] == 2) {
                $pokerType['type'] = "12";
            }
            //王弹
            else {
                $pokerType = null;
            }
        } else if (count($splitPoker["1111"]) > 0) {
            if (count($splitPoker["1111"]) == 1) {
                $pokerType['num'] = $splitPoker["1111"][0];
                if ($pokerType['length'] == 4) {
                    $pokerType['type'] = "1111";
                }
                //炸弹
                else if ($pokerType['length'] == 6 && (count($splitPoker["1"]) == 1 || count($splitPoker["1"]) == 2)) {
                    $pokerType['type'] = "111123";
                }
                //4带2
                else if ($pokerType['length'] == 8 && count($splitPoker["11"]) == 2) {
                    $pokerType['type'] = "11112233";
                }
                //4带2对
                else {
                    $pokerType = null;
                }
            } else {
                $pokerType = null;
            }
        } else if (count($splitPoker["111"]) > 0) {
            $l = count($splitPoker["111"]);
            if ($l == 1 || Poker::isStraight($splitPoker["111"])) { //l=1或GMain.SplitPoker["111"]的值连续
                $pokerType['num'] = $splitPoker["111"][0];
                if ($pokerType['length'] == 3 * $l) {
                    $pokerType['type'] = "111";
                }
                //3条，l>=2时为飞机
                else if ($pokerType['length'] == 4 * $l &&
                        count($splitPoker["1"]) == $l) {
                    $pokerType['type'] = "1112";
                }
                //3条带1，l>=2时为飞机
                else if ($pokerType['length'] == 5 * $l &&
                           count($splitPoker["11"]) == $l) {
                    $pokerType['type'] = "11122";
                }
                //3条带1对，l>=2时为飞机
                else {
                    $pokerType = null;
                }
            } else {
                $pokerType = null;
            }
        } else if (count($splitPoker["11"]) > 0) {
            $l = count($splitPoker["11"]);
            if ($l == 1 || ($l >= 3 && Poker::isStraight($splitPoker["11"]) )) {
                $pokerType['num'] = $splitPoker["11"][0];
                if ($pokerType['length'] == 2 * $l) {
                    $pokerType['type'] = "11";
                }
                //l=1时为对子，l>=3时为连对
                else {
                    $pokerType = null;
                }
            } else {
                $pokerType = null;
            }
        } else if (count($splitPoker["1"]) > 0) {
            $l = count($splitPoker["1"]);
            if ($l == 1 || ($l >= 5 && Poker::isStraight($splitPoker["1"]) )) {
                $pokerType['num']  = $splitPoker["1"][0];
                $pokerType['type'] = "1";
            } else {
                $pokerType = null;
            }
        } else {
            $pokerType = null;
        }

        if ($pokerType == null && $chaiNum > 0) {
            $pokerType = Poker::getType($pokers, $chaiNum - 1);
        }
        var_dump('pokerType');
        var_dump($pokerType);
        return $pokerType;
    }

    public static function splitPoker ($pokerNumbers , $chaiNum=null){//$pokerNumbers已排序，从小到大
        var_dump('Poker::splitPoker');
        $splitPokers=[];
        var_dump('pokerNumbers');
        var_dump($pokerNumbers);
        foreach ( Poker::$types as $key => $value ) {
            $splitPokers[$key] = [];
        }

        if( $chaiNum == null ){
            $chaiNum = 3;
        }

        $pokerNumbers_length = count($pokerNumbers);
        if( $pokerNumbers != null && $pokerNumbers_length > 0 ){
            $_pokerNumbers = [];
            //$_pokerNumbers从小到大
            for( $index = 0; $index < $pokerNumbers_length; $index++) {
                $_pokerNumbers[$index] = $pokerNumbers[$index];
            }

            $_pokerNumbers_length = count($_pokerNumbers);
            if( $_pokerNumbers[$_pokerNumbers_length - 1] == 18 && $_pokerNumbers[$_pokerNumbers_length  - 2] == 17 ){
                array_unshift($splitPoker["12"], 17);
                $_pokerNumbers_length = $_pokerNumbers_length - 2;
            }
            for( $index = $chaiNum; $index >= 0; $index-- ){
                $str = "1";
                for( $a = 1; $a <= $index; $a++ ){
                    $str = $str . '1';
                }
                var_dump('_pokerNumbers');
                var_dump($_pokerNumbers);

                if ( !empty($_pokerNumbers) ) {

                        for( $temp = $_pokerNumbers_length - 1; $temp >= $index; $temp-- ){
                            var_dump($_pokerNumbers[$temp] == $_pokerNumbers[$temp - $index] );
                            if( $_pokerNumbers[$temp] == $_pokerNumbers[$temp - $index] ){
                                array_unshift($splitPokers[$str] ,$_pokerNumbers[$temp]); // splitPokers[str]从小到大
                                for( $k = $temp; $k >= $temp - $index; $k-- ){
                                     unset($_pokerNumbers[$k]);
                                }
                            }
                        }
                }
               
            }
        }
        var_dump('splitPokers');
        var_dump($splitPokers);
        return $splitPokers;
    }


}
