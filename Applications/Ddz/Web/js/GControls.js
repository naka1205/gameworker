//玩家主控
var GControls={};
GControls.Poker=Class.create(JControls.Object,{
    pokerNumber:null
    ,seNumber:null
    ,imageData:null
    ,isHidePoker:true
    ,isSelected:null
    ,initialize:function ($super,imageName){
        $super();
        this.setSize(Game.PokerSize);
        this.imageData=ResourceData.Images[imageName];
        this.pokerNumber=this.imageData.num;
        this.seNumber=this.imageData.se;
        this.isSelected=false;
    }
    ,beginShow:function($super){
        $super();
        if(this.isHidePoker)this.setBGImage(ResourceData.Images.BeiMian);
        else this.setBGImage(this.imageData);
    }
    ,onClick:function(){
        if(this.parent.toSelectPoker){
            this.isSelected=!this.isSelected;
            JMain.JForm.show();
            return true;
        }
        return false;
    }
});
GControls.GrabButton=Class.create(JControls.Button,{
    score:null
    ,initialize:function ($super,  argP, argWH,score) {
        $super( argP, argWH);
        this.score=score;
        if(this.score&&this.score<=Game.MaxScore) this.BGColorAlpha = 0.5;
    }
    ,onClick:function(){

        if( this.score > 0 && this.score <= Game.MaxScore ){
             return false;
        }

        if ( this.score > Game.MaxScore ) {
                 
            Game.MaxScore = this.score;

        }

        this.BGColorAlpha = 0.5;
        Game.LandlordNum = Game.User.seat;
        Game.GrabTime++;
        Game.BtnPanel.visible = false;
        JMain.JForm.show();
        // Game.Grab(this.score);
         // 准备就绪
        var landlord_data = '{"type":"landlord","score":"'+ this.score+'"}';
        console.log("玩家抢分:" + landlord_data);
        App.Socket.send(landlord_data);


        return true;
    }
});
GControls.UserPanel=Class.create(JControls.Object,{
    pokerPanelNum:null
    ,hidePoker:null
    ,density:null
    ,toSelectPoker:null
    ,initialize:function ($super,argP, argWH,num,density){
        $super(argP, argWH);
        this.pokerPanelNum=num;
        //this.hidePoker=hidePoker;
        if(density!=null)this.density=density;
        else this.density=20;
    }
    ,beginShow:function($super){

        var pokers = [];

        switch (this.pokerPanelNum ) {
            case 0:
                pokers = Game.Landlord.Poker.sort(sortNumber);
                break;
            case 1:
                pokers = Game.User.Poker.sort(sortNumber);
                break;
            case 4:
                pokers = Game.Last.Poker.sort(sortNumber);
                break;
            default:
                break;
        }

        var poker_length = pokers.length;

        for(var i = 0; i < poker_length; i++){
            var x = 0,y= 0;
            var w = Game.PokerSize.width + ( poker_length - 1 ) * this.density;
            
            x = ( this.size.width - w ) / 2.0 + i * this.density;
            if ( this.toSelectPoker && pokers[i].isSelected ) {
                y = -20;
            }

            pokers[i].setRelativePosition({x:x,y:y});

            if ( this.hidePoker) {
                pokers[i].isHidePoker = true;
            }else {
                pokers[i].isHidePoker = false;
            }

        }
        this.clearControls();
        this.addControlInLast(pokers);


        if(Game.ToPlay && this.pokerPanelNum != 0 ){
            var label1=new JControls.Label().setFontType("bold").setFontSize(20).setTextAlign("left").setTextBaseline("bottom").setFontColor(JColor.red);
            var label2=new JControls.Label().setFontType("bold").setFontSize(20).setTextAlign("left").setTextBaseline("bottom").setFontColor(JColor.blue);
            if(this.pokerPanelNum==Game.LandlordNum)label1.setText("地主")
            else label1.setText("")
            if(this.pokerPanelNum==Game.LastHandNum)label2.setText("出牌")
            else label2.setText("")

            label1.setRelativePosition({x:80,y:-30});
            label2.setRelativePosition({x:200,y:-30});
            this.addControlInLast([label1,label2]);

        }
        $super();
        function sortNumber(a, b){
            if(b.pokerNumber==a.pokerNumber)return b.seNumber- a.seNumber;
            else return b.pokerNumber-a.pokerNumber;
        }
    }
});

GControls.PokerPanel=Class.create(JControls.Object,{
    pokerPanelNum:null
    ,hidePoker:null
    ,density:null
    ,toSelectPoker:null
    ,initialize:function ($super,argP, argWH,num,density){
        $super(argP, argWH);
 
    }
    ,beginShow:function($super){

        var pokers = [];
        if (this.pokerPanelNum == 2) {
            pokers = Game.Left.Poker.sort(sortNumber);
        } else {
            pokers = Game.Right.Poker.sort(sortNumber);
        }

        var poker_length = pokers.length;

        for (var i = 0; i < poker_length; i++) {
            var x = 0, y = 0;
            var w = Game.PokerSize.width + (poker_length - 1) * this.density;

            x = (this.size.width - w) / 2.0 + i * this.density;

            pokers[i].setRelativePosition({ x: x, y: y });

            if (this.hidePoker) {
                pokers[i].isHidePoker = true;
            } else {
                pokers[i].isHidePoker = false;
            }

        }  
        
        this.clearControls();
        this.addControlInLast(pokers);

        if(Game.ToPlay){
            var label1=new JControls.Label().setFontType("bold").setFontSize(20).setTextAlign("left").setTextBaseline("bottom").setFontColor(JColor.red);
            var label2=new JControls.Label().setFontType("bold").setFontSize(20).setTextAlign("left").setTextBaseline("bottom").setFontColor(JColor.blue);
            if(this.pokerPanelNum==Game.LandlordNum)label1.setText("地主")
            else label1.setText("")
            if(this.pokerPanelNum==Game.LastHandNum)label2.setText("出牌")
            else label2.setText("")

            if(this.pokerPanelNum==2){
                label1.setRelativePosition({x:-30,y:50});
                label2.setRelativePosition({x:-30,y:150});
                this.addControlInLast([label1,label2]);
            }else if(this.pokerPanelNum==3){
                label1.setRelativePosition({x:105,y:50});
                label2.setRelativePosition({x:105,y:150});
                this.addControlInLast([label1,label2]);
            }
        }

        $super();
        function sortNumber(a, b){
            if(b.pokerNumber==a.pokerNumber)return b.seNumber- a.seNumber;
            else return b.pokerNumber-a.pokerNumber;
        }
    }
});