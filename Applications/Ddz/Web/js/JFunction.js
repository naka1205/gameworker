var JFunction = {};

JFunction.Random = function (formNum, toNum) {
    return parseInt(Math.random() * (toNum - formNum + 1) + formNum);
};
JFunction.setLSData = function (key, jsonValue) {
    window.localStorage.setItem(key, JSON.stringify(jsonValue));
};
JFunction.getLSData = function (key) {
    return JSON.parse(window.localStorage.getItem(key));
};
JFunction.getNowTime = function () {
    var now = new Date();
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日
    var hh = now.getHours(); //时
    var mm = now.getMinutes();  //分
    return year + "/" + month + "/" + day + " " + hh + ":" + mm;
};
JFunction.getUserName = function () {
    var names = [
        "上官",
        "欧阳",
        "东方",
        "端木",
        "独孤",
        "司马",
        "南宫",
        "夏侯",
        "诸葛",
        "皇甫",
        "长孙",
        "宇文",
        "轩辕",
        "东郭",
        "子车",
        "东阳",
        "子言",
    ];

    var names2 = [
        "雀圣",
        "赌侠",
        "赌圣",
        "稳赢",
        "不输",
        "好运",
        "自摸",
        "有钱",
        "土豪",
    ];
    var idx = Math.floor(Math.random() * (names.length - 1));
    var idx2 = Math.floor(Math.random() * (names2.length - 1));
    return names[idx] + names2[idx2];
};

JFunction.PreLoadData = function (url) {
    var loadedNum = 0;//已加载资源数量
    var resourceNum = 0;//资源数量
    var postAction = function () { };//资源加载完成后的回调函数
    function imageLoadPost() {//每成功加载一个图片执行一次
        loadedNum++;
        if (loadedNum >= resourceNum) {//全部图片文件加载完后，继续加载声音
            loadedNum = 0;
            resourceNum = 0;
            loadAudio()
        }
    }
    function audioLoadPost() {//每成功加载一个声音执行一次
        loadedNum++;
        if (loadedNum >= resourceNum) {//全部声音文件加载完后，执行回调函数
            postAction()
        }
    }
    function loadImage() {//加载图片
        for (var m2 in ResourceData.Images) resourceNum++;
        if (resourceNum == 0) {
            imageLoadPost();
        } else {
            for (var m2 in ResourceData.Images) {
                ResourceData.Images[m2].data = new Image();
                ResourceData.Images[m2].data.src = url + ResourceData.Images[m2].path;
                ResourceData.Images[m2].data.onload = function () {
                    imageLoadPost();
                }
                ResourceData.Images[m2].data.onerror = function () {
                    alert("资源加载失败！")
                    return;
                }
            }
        }

    }
    function loadAudio() {//加载声音
        for (var m1 in ResourceData.Sound) resourceNum++;
        if (resourceNum == 0) {
            audioLoadPost();
        } else {
            for (var m1 in ResourceData.Sound) {
                ResourceData.Sound[m1].data = new Audio();
                var playMsg = ResourceData.Sound[m1].data.canPlayType('video/ogg');//测试浏览器是否支持该格式声音
                if ("" != playMsg) {
                    ResourceData.Sound[m1].data.src = url + ResourceData.Sound[m1].path + ResourceData.Sound[m1].soundName + ".ogg";
                } else {
                    ResourceData.Sound[m1].data.src = url + ResourceData.Sound[m1].path + ResourceData.Sound[m1].soundName + ".mp3";
                }
                ResourceData.Sound[m1].data.addEventListener("canplaythrough", function () {
                    audioLoadPost();
                }, false);
                ResourceData.Sound[m1].data.addEventListener("error", function () {
                    alert("资源加载失败！")
                    return;
                }, false);
            }
        }
    }
    loadImage();
    return {
        done: function (f) {
            if (f) postAction = f;
        }
    }
};

//获取图片数据
JFunction.getImageData = function (_context, _point, _size) {
    return _context.getImageData(_point.x, _point.y, _size.width, _size.height);
};
//通过图片数据绘制图片
JFunction.drawImageData = function (_context, _imgdata, _point, _dPoint, _dSize) {
    if (!_dPoint) _dPoint = { x: 0, y: 0 };
    if (!_dSize) _dSize = { width: _imgdata.width, height: _imgdata.height };
    _context.putImageData(_imgdata, _point.x, _point.y, _dPoint.x, _dPoint.y, _dSize.width, _dSize.height);
};
//颜色反转
JFunction.invert = function (_imgData) {
    var imageData = _imgData;
    for (var i = 0; i < imageData.data.length; i += 4) {
        var red = imageData.data[i], green = imageData.data[i + 1], blue = imageData.data[i + 2], alpha = imageData.data[i + 3];
        imageData.data[i] = 255 - red;
        imageData.data[i + 1] = 255 - green;
        imageData.data[i + 2] = 255 - blue;
        imageData.data[i + 3] = alpha;
    }
    return imageData;
};
//灰色
JFunction.changeToGray = function (_imgData) {
    var imageData = _imgData;
    for (var i = 0; i < imageData.data.length; i += 4) {
        var wb = parseInt((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
        imageData.data[i] = wb;
        imageData.data[i + 1] = wb;
        imageData.data[i + 2] = wb;
    }
    return imageData;
};
//加红
JFunction.changeToRed = function (_imgData) {
    var imageData = _imgData;
    for (var i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] += 50;
        if (imageData.data[i] > 255) imageData.data[i] = 255;

    }
    return imageData;
};
//图片旋转
JFunction.rotate = function (_context, _imageData, angle) {
    var returnData = _context.createImageData(_imageData.width, _imageData.height);
    var w, h, i, j, newPoint, x, y;
    var centerX = _imageData.width / 2.0;
    var centerY = _imageData.height / -2.0;
    var PI = 3.14159;
    for (h = 0; h < returnData.height; h++) {
        for (w = 0; w < returnData.width; w++) {
            i = (_imageData.width * h + w) * 4;
            newPoint = GetNewPoint({ x: w, y: h * -1 });
            x = parseInt(newPoint.x);
            y = parseInt(newPoint.y);
            if (x >= 0 && x < _imageData.width && -y >= 0 && -y < _imageData.height) {
                j = (_imageData.width * -y + x) * 4;
                returnData.data[i] = _imageData.data[j];
                returnData.data[i + 1] = _imageData.data[j + 1];
                returnData.data[i + 2] = _imageData.data[j + 2];
                returnData.data[i + 3] = _imageData.data[j + 3];
            }
        }
    }
    return returnData;
    function GetNewPoint(_point) {
        var l = (angle * PI) / 180;
        var newX = (_point.x - centerX) * Math.cos(l) - (_point.y - centerY) * Math.sin(l);
        var newY = (_point.x - centerX) * Math.sin(l) + (_point.y - centerY) * Math.cos(l);
        return { x: newX + centerX, y: newY + centerY };
    }
};
//高亮整个图片
JFunction.highLight = function (_imgData, n) {
    var imageData = _imgData;
    for (var i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = (imageData.data[i] + n) > 255 ? 255 : (imageData.data[i] + n);
        imageData.data[i + 1] = (imageData.data[i + 1] + n) > 255 ? 255 : (imageData.data[i + 1] + n);
        imageData.data[i + 2] = (imageData.data[i + 2] + n) > 255 ? 255 : (imageData.data[i + 2] + n);
    }
    return imageData;
};