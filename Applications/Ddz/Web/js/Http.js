var Http={};

Http.server = 'http://127.0.0.1:4321';
Http.auth = '';

Http.get = function(events,callback){
    var apiserver = Http.server + '/' +events;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(){  
        if( xhr.readyState == 4 ){  
            if(( xhr.status >= 200 && xhr.status<300) || xhr.status == 304 ){  //200 表示相应成功 304 表示缓存中存在请求的资源  
                // 对响应的信息写在回调函数里面  
                
                var str = xhr.status+' '+xhr.responseText;
                callback( eval("("+xhr.responseText+")") , str );
                
            }
            else{
                return 'request is unsucessful '+xhr.status;
            }
        }
    }
    xhr.open('get',apiserver,true);
    xhr.send();

};

Http.post = function(events,data,callback){
        
    var apiserver = Http.server + events;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(){  
        if( xhr.readyState == 4 ){  
            if(( xhr.status >= 200 && xhr.status<300) || xhr.status == 304 ){  //200 表示相应成功 304 表示缓存中存在请求的资源  
                // 对响应的信息写在回调函数里面  
                var str = xhr.status + ' ' + xhr.responseText;
                callback( eval("("+xhr.responseText+")") , str );
            }
            else{
                return 'request is unsucessful '+xhr.status;
            }
        }
    }
    xhr.open('post',apiserver,true);

    if ( App.Auth ) {
        xhr.setRequestHeader( "Auth", App.Auth ); 
    }
    xhr.send(Http.encode(data));

};


Http.encode = function(data){

        var pairs = [];
        var regexp = /%20/g;
        
        for (var name in data){
            var value = data[name].toString();
            var pair = encodeURIComponent(name).replace(regexp, "+") + "=" + encodeURIComponent(value).replace(regexp, "+");
            pairs.push(pair);
        }
        return pairs.join("&");

};

// Api.login = function(account,password){
//         var data = {
//             account : account,
//             password : password
//         };

//         Api.post('login',data,function(res){

//         });

// };