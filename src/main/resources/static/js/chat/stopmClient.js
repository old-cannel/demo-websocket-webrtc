/*stopm client samples*/

const myFriendsUrl = '/myFriends',
    myNameUrl = '/myName',
    websocketUrl = 'my-websocket',
    sendUrl = '/app/chat/',
    topicUrl = '/topic/chat/'
;
let
    stompClient = null,
    myName = null,
    toUserName = null;

$(function () {
    //好友、用户信息、订阅自己的消息通道
    // $.get(myFriendsUrl, myFriendsCallBack);
    // $.get(myNameUrl, myNameCallBack);

});


function myFriendsCallBack(data) {
    $.each(data.result, function (i, val) {
        $("#myFriends").append('<li><span>' + val + '</span> <button type="button" class="btn btn-info" onclick="call()" style="margin: 5px 0px;">呼叫</button></li>');
    });

}

/**
 * 获取自己的用户名，并建立websocket消息通道
 * @param data
 */
function myNameCallBack(data) {
    myName = data.result;
    subscribeSelf();
}

/**
 * 订阅自己通道
 */
function subscribeSelf() {
    var socket = new SockJS(websocketUrl);
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        //订阅自己的消息
        stompClient.subscribe(topicUrl + myName, function (message) {
            //处理消息
            console.info(message);
            let body = JSON.parse(message.body);
            if (body.code == 10000) {
                let result = body.result;
                if (result.sdpMsg) {
                    //这个里面处理视频聊天
                    toUserName = result.fromUserName;
                    dealSdp(result.sdpMessage);
                } else {
                    //    这个里面是普通的聊天
                    alert("发送人：" + result.fromUserName + ",内容:" + result.message);
                }
            } else {
                alert("未知的消息或请求处理失败");
            }


        });
    });
}

/**
 * 通过用户名发普通消息
 * @param username
 * @param msg
 */
function sendMsg(username, msg) {
    stompClient.send(sendUrl + username, {}, JSON.stringify({'message': msg}))
}

/**
 * 发送sdp offer 或 answer
 * @param username
 * @param sdpMsg
 */
function sendSdpMsg(username, sdpMsg) {
    stompClient.send(sendUrl + username, {}, JSON.stringify({'sdpMessage': sdpMsg}));
}


/**
 * 申请聊天
 * @param username
 * @param type offer请求，answer同意，deny拒绝,hangup挂机
 */
function applySdp(username, type) {
    stompClient.send(sendUrl + username, {}, JSON.stringify({'sdpMessage': {'type': type}}))
}

/**
 * 处理sdpMsg消息
 */
function dealSdp(sdpMsg) {
    debugger;
    if (sdpMsg.type == 'offer') {

    } else if (sdpMsg.type == 'answer') {
    } else if (sdpMsg.type == 'deny') {
    } else if (sdpMsg.type == 'hangup') {
    }
}

