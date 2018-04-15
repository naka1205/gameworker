

var Game={
        Roomid : null//房间ID
        , Ju: null//当前局数
        , User: null//当前用户
        , Left: null//左边用户
        , Right: null//右边用户
        , Config: null//游戏配置
        , Panel: null//房间面板
        , BtnPanel: null//按钮面板
        , Last: null//扑克
        , Poker: null//扑克
        , Landlord: null//地主
        , LandlordNum: null//地主编号
        , BeginNum: null//发牌开始编号
        , DealerNum: null//当前操作编号
        , MaxScore: null//抢牌最高分
        , GrabTime: null//抢牌次数
        , DealingHandle: null//发牌句柄
        , DealingNum: null//已发牌数
        , PokerSize: { width: 100, height: 120 }//扑克牌大小
        , LastWin: null//上一把赢家
        , LastHandNum: null//标示谁出的最后一手牌
        , LastHandPokerType: null//最后一手牌类型
        , ToPlay: null//已抢完地主，出牌中
        , PokerTypes: {//扑克牌类型
                "1": { weight: 1, allNum: 1, minL: 5, maxL: 12 }
                , "11": { weight: 1, allNum: 2, minL: 3, maxL: 10 }
                , "111": { weight: 1, allNum: 3, minL: 1, maxL: 6 }
                , "1111": { weight: 2, allNum: 4, minL: 1, maxL: 1 }
                , "1112": { weight: 1, zcy: "111", fcy: "1", fcyNum: 1, allNum: 4, minL: 1, maxL: 5 }
                , "11122": { weight: 1, zcy: "111", fcy: "11", fcyNum: 1, allNum: 5, minL: 1, maxL: 4 }
                , "111123": { weight: 1, zcy: "1111", fcy: "1", fcyNum: 2, allNum: 6, minL: 1, maxL: 1 }
                , "11112233": { weight: 1, zcy: "1111", fcy: "11", fcyNum: 2, allNum: 8, minL: 1, maxL: 1 }
                , "12": { weight: 3, allNum: 2, minL: 1, maxL: 1 }
        }

};


//创建房间
Game.init = function () {
        // 创建websocket
        App.Socket = new WebSocket("ws://" + document.domain + ":7070");

        App.Socket.onclose = function () {
                console.log("连接关闭");
        }

        App.Socket.onerror = function () {
                console.log("出现错误");
        }

        // 当socket连接打开时
        App.Socket.onopen = Game.onOpen;

        // 当有消息时根据消息类型显示不同信息
        App.Socket.onmessage = Game.onMessage;

        Game.User = {};
        Game.Left = {};
        Game.Right = {};
        Game.Last = {};
        Game.Landlord = {};
        Game.Config = {};
};

//连接
Game.onOpen = function(){

        var login_data = '{"type":"login","auth":"' + App.Auth + '"}';
        console.log('onOpen', "发送数据:" + login_data);

        App.Socket.send(login_data);  

};
//登录
Game.login = function () {

        var data = {
                roomid: App.Roomid
        }
        console.log(data);
        Http.post('/join', data, function (res) {
                console.log(res);
                if (res.status == true) {
                        App.Clients = res.clients;
                        for (let key in App.Clients) {
                                var name = Base64.decode(App.Clients[key].name);
                                App.Clients[key].name = name;
                        }
                        var join_data = '{"type":"join","roomid":"' + App.Roomid + '"}';
                        console.log('join', "发送数据:" + join_data);
                        App.Socket.send(join_data);
                }

        })

};
//事件
Game.onMessage = function(e){
            if ( e.data == "null" ) { return ;}
            console.log(e);
            var data = eval("("+e.data+")");
            switch(data['type']){
                    // 服务端ping客户端
                    case 'ping':
                        App.Socket.send('{"type":"pong"}');
                        break;
                    case 'init':
                            console.log('init');
                        //     var data = {
                        //             client_id: data['client_id']
                        //     }
                        //     Http.post('/bind', data, function (res) {
                        //             console.log(res);
                        //     })

                            break;    
                    // 登录 
                    case 'login':
                            console.log('login');
                            Game.login();
                        
                        break;
                    // 加入 更新用户列表
                    case 'join':
                            console.log('join');
                            console.log(data);
                            
                            var name = Base64.decode(data['name']);

                            if ( data['clients'] ) {
                                    Game.Roomid = App.Roomid;
                                    Game.Config = data['config'];     
                                    Game.Ju = 1;     

                                    Game.User.uid = data['uid'];
                                    Game.User.name = name;
                                    Game.User.seat = data['seat'];
                                    Game.User.state = 1;

                                    Game.join();
                            }
                            else {

                                    for (let key in App.Clients) {
                                            if (data['seat'] == App.Clients[key].seat) {
                                                    App.Clients[key].uid = data['uid'];
                                                    App.Clients[key].name = name;
                                                    App.Clients[key].state = 1;
                                                    break;
                                            }   
                                            
                                    }
                                    Game.flush();
                            }
                        
                        break;
                    //玩家准备
                    case 'ready':
 

                        break;
                    //开始
                    case 'begin':
                            console.log(data['name'] + "开始游戏");
                            Game.DealingNum = 1;
                            Game.User.Poker = data['poker'];
                            Game.begin();
                        break;
                    //抢地主
                    case 'landlord':
                            console.log(data['name'] + "开始抢地主");
                            Game.LastHandNum = data['seat'];
                            //地主已经产生
                            if (data['landlord_poker']) {
                                    Game.Landlord.Poker = data['landlord_poker'];
                            }

                            Game.LandlordNum = data['landlord_num'];
                            Game.MaxScore = data['max_score'];
                            Game.GrabTime = data['grab_time'];

                            Game.landlordPlay();

                        break;
                    // 用户掉线 更新用户列表
                    case 'logout':
 
                        break;
            }

};

//房间
Game.join = function(){
        console.log('Game.join');
        
        switch ( Game.User.seat ){
                case 1:
                        Game.Left = App.Clients[2];
                        Game.Right = App.Clients[3];
                        break;
                case 2:
                        Game.Left = App.Clients[3];
                        Game.Right = App.Clients[1];
                        break;
                case 3:
                        Game.Left = App.Clients[1];
                        Game.Right = App.Clients[2];
                        break;
        }

        // console.log(Game.User);
        // console.log(Game.Left);
        // console.log(Game.Right);

        JMain.JForm.clearControls();
        JMain.JForm.setBGImage(ResourceData.Images.bg3);

        Game.Panel = new JControls.Panel({ x: 0, y: 0 }, { width: 800, height: 60 });//用于显示房间信息

        var RoomLabel =new JControls.Label({x:10,y:10},{width:50,height:30}).setText('房间:' ).setFontType("bold").setFontSize(20).setFontColor(JColor.red);
        var RoomIdLabel = new JControls.Label({ x: 60, y: 10 }, { width: 100, height: 30 }).setText(Game.Roomid).setFontType("bold").setFontSize(20).setFontColor(JColor.red);

        var JuLabel = new JControls.Label({ x: 10, y: 40 }, { width: 50, height: 30 }).setText('局数:').setFontType("bold").setFontSize(20).setFontColor(JColor.red);
        var GameJuLabel = new JControls.Label({ x: 60, y: 40 }, { width: 100, height: 30 }).setText(Game.Ju + '/' + Game.Config.ju ).setFontType("bold").setFontSize(20).setFontColor(JColor.red);

        var OutButton = new JControls.Button({x:680,y:10},{width:100,height:30}).setText("退出").setBGImage(ResourceData.Images.btn);
        OutButton.onClick = function(){

                // 准备就绪
                var logout_data = '{"type":"logout","roomid":"' + Game.Roomid+'"}';
                console.log("玩家返回:"+logout_data);
                GInfo.Socket.send(logout_data);
                Game.outRoom();
        }

        var room_controls = [RoomLabel, RoomIdLabel, JuLabel, GameJuLabel,OutButton];

        Game.Panel.addControlInLast(room_controls);



        Game.User.Panel = new JControls.Panel({ x: 300, y: 420 }, { width: 200, height: 50 });//用于显示玩家信息
        var NameLabel = new JControls.Label({ x: 0, y: 0 }, { width: 200, height: 20 }).setText(Game.User.name).setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('center');
        var UserLabel = new JControls.Label({ x: 0, y: 30 }, { width: 100, height: 20 }).setText('玩家').setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('right');
        var StateLabel = new JControls.Label({ x: 100, y: 30 }, { width: 100, height: 20 }).setText(App.State[Game.User.state]).setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('left');

        Game.User.NameLabel = NameLabel;
        Game.User.StateLabel = StateLabel;

        Game.User.Panel.addControlInLast([UserLabel,NameLabel,StateLabel]);


        Game.Left.Panel = new JControls.Panel({ x: 0, y: 260 }, { width: 160, height: 60 });//用于显示左边玩家信息

        var LeftNameLabel = new JControls.Label({ x: 0, y: 0 }, { width: 160, height: 20 }).setText(Game.Left.name).setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('center');;
        var LeftUserLabel = new JControls.Label({ x: 0, y: 30 }, { width: 80, height: 20 }).setText('左玩家').setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('right');
        
        var left_state = Game.Left.state != null ? App.State[Game.Left.state] : '';
        var LeftStateLabel = new JControls.Label({ x: 80, y: 30 }, { width: 80, height: 20 }).setText(left_state).setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('left');;

        Game.Left.NameLabel = LeftNameLabel;
        Game.Left.StateLabel = LeftStateLabel;

        Game.Left.Panel.addControlInLast([LeftUserLabel,LeftNameLabel,LeftStateLabel]);


        Game.Right.Panel = new JControls.Panel({ x: 640, y: 260 }, { width: 160, height: 60 });//用于显示右边玩家信息

        var RightNameLabel = new JControls.Label({ x: 0, y: 0 }, { width: 160, height: 20 }).setText(Game.Right.name).setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('center');
        var RightUserLabel = new JControls.Label({ x: 80, y: 30 }, { width: 80, height: 20 }).setText('右玩家').setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('left');
        
        var right_state = Game.Right.state != null ? App.State[Game.Right.state] : '';
        var RightStateLabel = new JControls.Label({ x: 0, y: 30 }, { width: 80, height: 20 }).setText(right_state).setFontType("bold").setFontSize(20).setFontColor(JColor.blue).setTextAlign('right');

        Game.Right.NameLabel = RightNameLabel;
        Game.Right.StateLabel = RightStateLabel;

        Game.Right.Panel.addControlInLast([RightUserLabel,RightNameLabel,RightStateLabel]);

        Game.BtnPanel = new JControls.Object({ x: 160, y: 250 }, { width: 480, height: 40 });//用于显示游戏控制按钮
        var ReadyButton = new JControls.Button({x:0,y:0},{width:100,height:40}).setText("准备").setBGImage(ResourceData.Images.btn).visible = false;
        ReadyButton.onClick = function(){
                        // 准备就绪
                        var ready_data = '{"type":"ready","room_id":"'+Game.RoomId+'"}';
                        console.log("玩家准备:"+ready_data);
                        GInfo.Socket.send(ready_data);
        }

        
        Game.BtnPanel.addControlInLast([ReadyButton]);

        JMain.JForm.addControlInLast([Game.Panel,Game.BtnPanel,Game.User.Panel,Game.Left.Panel,Game.Right.Panel]);

        JMain.JForm.show();

};

Game.flush = function(){
        console.log('Game.flush');
        console.log(App.Clients);

        for (var key in App.Clients) {
                if ( Game.User.seat == key ) {
                        Game.User.name = App.Clients[key].name;
                        Game.User.state = App.Clients[key].state;

                        Game.User.NameLabel.text = Game.User.name;
                        Game.User.StateLabel.text = App.State[Game.User.state];
                    continue;
                }
                if (Game.Left.seat == key ) {
                        Game.Left.name = App.Clients[key].name;
                        Game.Left.state = App.Clients[key].state;

                        Game.Left.NameLabel.text = Game.Left.name;
                        Game.Left.StateLabel.text = App.State[Game.Left.state];

                } else if (Game.Right.seat == key ) {
                        Game.Right.name = App.Clients[key].name;
                        Game.Right.state = App.Clients[key].state;

                        Game.Right.NameLabel.text = Game.Right.name;
                        Game.Right.StateLabel.text = App.State[Game.Right.state];

                }
 
        }

        JMain.JForm.show();
};

Game.begin = function(){
        console.log('Game.begin');

        Game.Landlord.PokerPanel = new GControls.UserPanel({ x: 240, y: 10 }, { width: 320, height: 120 }, 0, 105);

        Game.User.PokerPanel = new GControls.UserPanel({x:200,y:300},{width:400,height:120},1,20);
        Game.Left.PokerPanel = new GControls.PokerPanel({ x: 20, y: 140 }, { width: 100, height: 120},2,20);
        Game.Right.PokerPanel = new GControls.PokerPanel({ x: 680, y: 140 }, { width: 100, height: 120 }, 3, 20);

        Game.Last.PokerPanel = new GControls.UserPanel({ x: 200, y: 120 }, { width: 400, height: 120 }, 4, 20);

        Game.User.PokerPanel.hidePoker = false;//hidePoker为false，显示扑克正面

        Game.Last.PokerPanel.hidePoker = false;

        Game.Left.PokerPanel.hidePoker = true;
        Game.Right.PokerPanel.hidePoker = true;
        Game.Landlord.PokerPanel.hidePoker = true;

        // Game.Last.PokerPanel.setBGColor(JColor.red);

        JMain.JForm.addControlInLast([Game.User.PokerPanel, Game.Landlord.PokerPanel, Game.Left.PokerPanel, Game.Right.PokerPanel, Game.Last.PokerPanel]);
        Game.User.PokerPanel.toSelectPoker = false;
        Game.ToPlay = false;

        for (var i = 0; i < Game.User.Poker.length; i++) {
                Game.User.Poker[i] = new GControls.Poker(Game.User.Poker[i]);
        }

        Game.Landlord.Poker = [0,0,0];
        for (var i = 0; i < 3; i++) {
                Game.Landlord.Poker[i] = new GControls.Poker(Game.Landlord.Poker[i]);
        }

        Game.Right.Poker = [0];
        Game.Right.Poker[0] = new GControls.Poker(Game.Right.Poker[0]);

        Game.Left.Poker = [0];
        Game.Left.Poker[0] = new GControls.Poker(Game.Left.Poker[0]);

        Game.Last.Poker = [];

        Game.LastWin = 0;
        Game.BeginNum = 1;
        Game.dealing();
};

Game.dealing = function(){//发牌
    console.log('Game.dealing');

    if(Game.DealingHandle)clearTimeout(Game.DealingHandle);

    if(Game.BeginNum >= 17) {//已发完牌
        Game.MaxScore = 0;
        Game.GrabTime = 0;
        Game.LastHandNum = 0;
        Game.landlordPlay();//抢地主

    }else{

        Game.BeginNum++;
        Game.DealingHandle = setTimeout(Game.dealing, 50);
        JMain.JForm.show();
    }
};


Game.landlordPlay = function(){
        console.log('Game.landlordPlay');
    if(Game.GrabTime == 3 && Game.MaxScore == 0 ){//没有人抢地主
        Game.over();
        return;
    }

    if( Game.MaxScore == 3 || ( Game.MaxScore > 0 && Game.GrabTime ==3 ) ){//地主已产生

            Game.Landlord.PokerPanel.clearControls();
            for (var i = 0; i < Game.Landlord.Poker.length; i++) {
                    Game.Landlord.Poker[i] = new GControls.Poker(Game.Landlord.Poker[i]);
            }
            Game.Landlord.PokerPanel.hidePoker = false;
            
            switch(Game.LastHandNum){
                    case  Game.User.seat:
                            for (var i = 0; i < Game.Landlord.Poker.length; i++) {
                                      Game.User.Poker.push(Game.Landlord.Poker[i]);
                            }
                            Game.Left.StateLabel.text = App.State[4];
                            Game.Right.StateLabel.text = App.State[4];
                            Game.LastHandNum = 0;
 
                            Game.ToPlay = true;
                            Game.play();

                            break;
                    case Game.Left.seat:
                            Game.Left.StateLabel.text = App.State[5];
                            Game.Right.StateLabel.text = App.State[4];
                            break;
                    case Game.Right.seat:
                            Game.Left.StateLabel.text = App.State[4];
                            Game.Right.StateLabel.text = App.State[5];
                        break;
            }

            JMain.JForm.show();
            return;
    }

    var hand_num = 0;
        if (Game.GrabTime == 0 && Game.LastHandNum == 0 && Game.LastWin == 0 ) {
        hand_num = 1;
    }else{
        hand_num = Game.LastHandNum + 1;
        if ( hand_num > 3 ) {
             hand_num = 1;
        }
    }

    switch(hand_num){
            case Game.User.seat:

                    Game.BtnPanel.clearControls();
                    var Button1 = new GControls.GrabButton({x:0,y:0},{width:100,height:40},1).setText("1分").setBGImage(ResourceData.Images.btn);
                    var Button2 = new GControls.GrabButton({x:110,y:0},{width:100,height:40},2).setText("2分").setBGImage(ResourceData.Images.btn);
                    var Button3 = new GControls.GrabButton({x:220,y:0},{width:100,height:40},3).setText("3分").setBGImage(ResourceData.Images.btn);
                    var Button4 = new GControls.GrabButton({x:330,y:0},{width:100,height:40},0).setText("不抢").setBGImage(ResourceData.Images.btn);
                    Game.BtnPanel.addControlInLast([Button1,Button2,Button3,Button4]);
                    Game.BtnPanel.visible=true;
                    
                    Game.Left.StateLabel.text = App.State[4];
                    Game.Right.StateLabel.text = App.State[4];
                    break;
            case Game.Left.seat:
                    Game.Left.StateLabel.text = App.State[3];
                    Game.Right.StateLabel.text = App.State[4];
                break;
            case Game.Right.seat:
                    Game.Left.StateLabel.text = App.State[4];  
                    Game.Right.StateLabel.text = App.State[3];
                break;
    }

    JMain.JForm.show();

};

Game.grab = function (score) {
        console.log('Game.grab');

};

Game.play = function(){
        console.log('Game.play');
        Game.LastHandNum = Game.User.seat;

};

Game.over = function(){
        console.log('Game.over');

};