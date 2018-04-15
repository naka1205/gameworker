var App = {
    CanvasID: 'ddz',
    Size: { width: 800, height: 480 },
    URL: '',
    Socket: null,
    User:null,
    Auth:null,
    Roomid:null,
    Clients: [],
    State: ['等待', '准备', '开始', '选分', '进行', '出牌', '离开', '离线']
}


App.init = function () {
    App.User = {
        uid: '',
        account: '',
        password: '',
        name: ''
    }
    console.log('App.init');

    JFunction.PreLoadData(App.URL).done(function () {
        JMain.JForm = new JControls.Form(App.Size, App.CanvasID).setBGImage(ResourceData.Images.bg1);
        JMain.JForm.clearControls();

        App.BtnPanel = new JControls.Object({ x: 0, y: 280 }, { width: 800, height: 40 });//用于显示游戏控制按钮
        var LoginButton1 = new JControls.Button({ x: 280, y: 0 }, { width: 120, height: 40 }).setBGImage(ResourceData.Images.login1);
        var LoginButton2 = new JControls.Button({ x: 420, y: 0 }, { width: 120, height: 40 }).setBGImage(ResourceData.Images.login2);

        LoginButton1.onClick = function () {

            var users = Cookie.get('users');
            console.log(users);
            if ( users && users.name ) {
                var data = {
                    account: users.account,
                    password: users.password,
                }
                Http.post('/login', data, function (res) {
                    console.log(res);
                    if (res.status == true) {
                        App.Auth = res.auth;
                        App.User = res.user;
                        App.User.name = Base64.decode(App.User.name);
                        Cookie.set('users', res.user, 7);
                        if ( res.user.roomid ) {
                            App.Roomid = res.user.roomid;
                            Game.init();
                        }else{
                            App.hall();
                        }
                        
                    }
                })
            } else {

                var account = Date.now();
                var data = {
                    account: account,
                    password: ''
                }

                Http.post('/guest', data, function (res) {
                    console.log(res);
                    if (res.status == true) {
                        App.User.account = res.account;
                        App.User.password = res.password;
                        App.create();
                    }
                })

            }


        }

        LoginButton2.onClick = function () {
            var data = {
                account: App.User.account,
                password: App.User.password,
            }
            Http.post('/login', data, function (res) {
                console.log(res);
                if (res.status == true) {
                    console.log(res.account);
                }
            })
        }

        var init_controls = [LoginButton1, LoginButton2];

        App.BtnPanel.addControlInLast(init_controls);

        JMain.JForm.addControlInLast([App.BtnPanel]);

        JMain.JForm.show();
    });

};


//创建角色
App.create = function () {
    console.log('App.create');

    JMain.JForm.clearControls();
    JMain.JForm.setBGImage(ResourceData.Images.bg2);

    App.CreatePanel = new JControls.Object({ x: 200, y: 100 }, { width: 400, height: 300 });//用于显示房间信息

    App.User.name = JFunction.getUserName();

    var CreateLabel = new JControls.Label({ x: 100, y: 100 }, { width: 100, height: 40 }).setText(App.User.name);
    var ChangeButton = new JControls.Button({ x: 220, y: 100 }, { width: 40, height: 40 }).setText('更换');

    ChangeButton.onClick = function () {
        App.User.name = JFunction.getUserName();
        CreateLabel.setText(App.User.name);
        JMain.JForm.show();
    }
    var CreateButton = new JControls.Button({ x: 180, y: 200 }, { width: 100, height: 40 }).setText("确认");

    CreateButton.onClick = function () {

        var data = {
            account: App.User.account,
            password: App.User.password,
            name: Base64.encode(App.User.name)
        }
        Http.post('/register', data, function (res) {
            console.log(res);
            if (res.status == true) {
                App.Auth = res.auth;
                App.User = res.user;
                App.User.name = Base64.decode(App.User.name);
                Cookie.set('users', res.user, 7);
                App.hall();
            }
        })
    }

    var create_controls = [CreateLabel, ChangeButton, CreateButton];

    App.CreatePanel.addControlInLast(create_controls);

    JMain.JForm.addControlInLast([App.CreatePanel]);

    JMain.JForm.show();
};


//登录大厅
App.hall = function () {
    console.log('App.hall');

    JMain.JForm.clearControls();
    JMain.JForm.setBGImage(ResourceData.Images.bg2);

    App.HallPanel = new JControls.Panel({ x: 0, y: 0 }, { width: 150, height: 20 });//用于显示玩家信息

    var UserLabel = new JControls.Label({ x: 10, y: 0 }, { width: 50, height: 20 }).setText('用户:').setFontType("bold").setFontSize(20).setFontColor(JColor.blue);
    var NameLabel = new JControls.Label({ x: 60, y: 0 }, { width: 100, height: 20 }).setText(App.User.name).setFontType("bold").setFontSize(20).setFontColor(JColor.blue);
    var GoldsLabel = new JControls.Label({ x: 10, y: 20 }, { width: 50, height: 20 }).setText('金币:').setFontType("bold").setFontSize(20).setFontColor(JColor.blue);
    var GoldsNumLabel = new JControls.Label({ x: 60, y: 20 }, { width: 100, height: 20 }).setText(App.User.golds.toString()).setFontType("bold").setFontSize(20).setFontColor(JColor.blue);


    App.HallPanel.addControlInLast([UserLabel, NameLabel, GoldsLabel, GoldsNumLabel]);

    App.BtnPanel = new JControls.Panel({ x: 0, y: 280 }, { width: 800, height: 40 });//用于显示游戏控制按钮
    var JoinButton = new JControls.Button({ x: 300, y: 0 }, { width: 100, height: 40 }).setText("加入房间").setBGImage(ResourceData.Images.btn);

    JoinButton.onClick = function () {
        JMain.JForm.clearControls();
        console.log("加入房间");
        App.RoomPanel = new JControls.Panel({ x: 110, y: 40 }, { width: 580, height: 400 }).setBGImage(ResourceData.Images.tcbg);

        var RoomIdLabel1 = new JControls.Label({ x: 100, y: 80 }, { width: 40, height: 20 }).setText('').setTextAlign('center');
        var RoomIdLabel2 = new JControls.Label({ x: 160, y: 80 }, { width: 40, height: 20 }).setText('').setTextAlign('center');
        var RoomIdLabel3 = new JControls.Label({ x: 230, y: 80 }, { width: 40, height: 20 }).setText('').setTextAlign('center');
        var RoomIdLabel4 = new JControls.Label({ x: 290, y: 80 }, { width: 40, height: 20 }).setText('').setTextAlign('center');
        var RoomIdLabel5 = new JControls.Label({ x: 350, y: 80 }, { width: 40, height: 20 }).setText('').setTextAlign('center');
        var RoomIdLabel6 = new JControls.Label({ x: 410, y: 80 }, { width: 40, height: 20 }).setText('').setTextAlign('center');

        RoomIdLabel1.isSelect = true;
        RoomIdLabel2.isSelect = true;
        RoomIdLabel3.isSelect = true;
        RoomIdLabel4.isSelect = true;
        RoomIdLabel5.isSelect = true;
        RoomIdLabel6.isSelect = true;

        App.RoomPanel.Label = [RoomIdLabel1, RoomIdLabel2, RoomIdLabel3, RoomIdLabel4, RoomIdLabel5, RoomIdLabel6];
        App.RoomPanel.addControlInLast(App.RoomPanel.Label);

        var RoomIdButton1 = new JControls.Button({ x: 100, y: 160 }, { width: 120, height: 40 }).setText('1').setBGImage(ResourceData.Images.btn);
        var RoomIdButton2 = new JControls.Button({ x: 220, y: 160 }, { width: 120, height: 40 }).setText('2').setBGImage(ResourceData.Images.btn);
        var RoomIdButton3 = new JControls.Button({ x: 340, y: 160 }, { width: 120, height: 40 }).setText('3').setBGImage(ResourceData.Images.btn);
        var RoomIdButton4 = new JControls.Button({ x: 100, y: 200 }, { width: 120, height: 40 }).setText('4').setBGImage(ResourceData.Images.btn);
        var RoomIdButton5 = new JControls.Button({ x: 220, y: 200 }, { width: 120, height: 40 }).setText('5').setBGImage(ResourceData.Images.btn);
        var RoomIdButton6 = new JControls.Button({ x: 340, y: 200 }, { width: 120, height: 40 }).setText('6').setBGImage(ResourceData.Images.btn);
        var RoomIdButton7 = new JControls.Button({ x: 100, y: 240 }, { width: 120, height: 40 }).setText('7').setBGImage(ResourceData.Images.btn);
        var RoomIdButton8 = new JControls.Button({ x: 220, y: 240 }, { width: 120, height: 40 }).setText('8').setBGImage(ResourceData.Images.btn);
        var RoomIdButton9 = new JControls.Button({ x: 340, y: 240 }, { width: 120, height: 40 }).setText('9').setBGImage(ResourceData.Images.btn);
        var RoomIdButton0 = new JControls.Button({ x: 100, y: 280 }, { width: 120, height: 40 }).setText('0').setBGImage(ResourceData.Images.btn);
        var RoomIdButton10 = new JControls.Button({ x: 220, y: 280 }, { width: 120, height: 40 }).setText('清除').setBGImage(ResourceData.Images.btn);
        var RoomIdButton11 = new JControls.Button({ x: 340, y: 280 }, { width: 120, height: 40 }).setText('删除').setBGImage(ResourceData.Images.btn);
        
        RoomIdButton1.onClick = function () {
            
            var text = this.buttonLabel.text;

            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if ( App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton2.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton3.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton4.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton5.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton6.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton7.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton8.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton9.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton0.onClick = function () {
            var text = this.buttonLabel.text;
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                if (App.RoomPanel.Label[index].text == '') {
                    App.RoomPanel.Label[index].text = text;
                    break;
                }
            }
            JMain.JForm.show();
        }
        RoomIdButton10.onClick = function () {
            for (let index = App.RoomPanel.Label.length - 1; index >= 0; index--) {
                App.RoomPanel.Label[index].text = '';
            }
            JMain.JForm.show();
        }

        RoomIdButton11.onClick = function () {
            for (let index = App.RoomPanel.Label.length - 1; index >= 0; index--) {
                if (App.RoomPanel.Label[index].text != '') {
                    App.RoomPanel.Label[index].text = '';
                    break;
                }
            }
            JMain.JForm.show();
        }

        //按钮 确认
        var ConfirmButton = new JControls.Button({ x: 240, y: 340 }, { width: 107, height: 35 }).setBGImage(ResourceData.Images.confirm);

        ConfirmButton.onClick = function () {
            var roomid = '';
            for (let index = 0; index < App.RoomPanel.Label.length; index++) {
                let text = App.RoomPanel.Label[index].text;
                if ( text == '' ) {
                    return false;
                }
                roomid = roomid + text;
            }
            console.log(roomid);
            var data = {
                roomid: roomid
            }
            App.Roomid = roomid;

            Http.post('/check', data, function (res) {
                console.log(res);
                if (res.status == true) {
                    App.Roomid = res.rooms.roomid;
                    Game.init();
                }
            })
            
        }

        App.RoomPanel.Button = [ConfirmButton, RoomIdButton1, RoomIdButton2, RoomIdButton3, RoomIdButton4, RoomIdButton5, RoomIdButton6, RoomIdButton7, RoomIdButton8, RoomIdButton9, RoomIdButton0, RoomIdButton10, RoomIdButton11];
        App.RoomPanel.addControlInLast(App.RoomPanel.Button);

        JMain.JForm.addControlInLast([App.RoomPanel]);
        JMain.JForm.show();
    }

    var CreateButton = new JControls.Button({ x: 420, y: 0 }, { width: 100, height: 40 }).setText("创建房间").setBGImage(ResourceData.Images.btn);

    CreateButton.onClick = function () {
        JMain.JForm.clearControls();
        console.log("创建房间");
        Game.Config = {
            ju: 10
        }
        
        App.RoomPanel = new JControls.Panel({ x: 110, y: 40 }, { width: 580, height: 400 }).setBGImage(ResourceData.Images.tcbg);
        //选项 局数
        var JuPanel = new JControls.Panel({ x: 25, y: 80 }, { width: 520, height: 40 }).setBGImage(ResourceData.Images.input1);
        var JuButton1 = new JControls.Button({ x: 100, y: 0 }, { width: 40, height: 40 }).setBGImage(ResourceData.Images.checkbox_full);
        var JuLabel1 = new JControls.Label({ x: 150, y: 10 }, { width: 140, height: 30 }).setText("十局").setFontType("bold").setFontSize(16);
        var JuButton2 = new JControls.Button({ x: 300, y: 0 }, { width: 40, height: 40 }).setBGImage(ResourceData.Images.checkbox_void);
        var JuLabel2 = new JControls.Label({ x: 350, y: 10 }, { width: 140, height: 30 }).setText("二十局").setFontType("bold").setFontSize(16);

        JuButton1.onClick = function () {
            console.log("十局");
            Game.Config = {
                ju: 10
            }
            JuButton2.setBGImage(ResourceData.Images.checkbox_void);
            JuButton1.setBGImage(ResourceData.Images.checkbox_full);
            JMain.JForm.show();
        }
        JuButton2.onClick = function () {
            Game.Config = {
                ju: 20
            }
            console.log("二十局");
            JuButton1.setBGImage(ResourceData.Images.checkbox_void);
            JuButton2.setBGImage(ResourceData.Images.checkbox_full);
            JMain.JForm.show();
        }

        JuPanel.addControlInLast([JuButton1, JuLabel1, JuButton2, JuLabel2]);

        //按钮 确认
        var ConfirmButton = new JControls.Button({ x: 240, y: 340 }, { width: 107, height: 35 }).setBGImage(ResourceData.Images.confirm);

        ConfirmButton.onClick = function () {
            var data = Game.Config;
            Http.post('/create', data, function (res) {
                console.log(res);
                if (res.status == true) {
                    App.Roomid = res.rooms.roomid;
                    Game.init();
                }
            })
        }

        App.RoomPanel.addControlInLast([JuPanel, ConfirmButton]);

        JMain.JForm.addControlInLast([App.RoomPanel]);
        JMain.JForm.show();

    }

    App.BtnPanel.addControlInLast([CreateButton, JoinButton]);

    JMain.JForm.addControlInLast([App.HallPanel, App.BtnPanel]);

    JMain.JForm.show();
};