/*chat client samples*/
const myFriendsUrl = '/myFriends',
    myNameUrl = '/myName',
    websocketUrl = 'my-websocket'
;
let myName = null,
    stompClient = null,
    toUserName = null,
    myVideo = null,
    myVideoStream = null,
    yourVideo = null,
    yourVideoStream = null,
    rtcPeerConnection = null,
    opt = {"audio": true, "video": true},
    constraints = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    },
    doNothing = function () {
    }
;
$(function () {
    //好友、用户信息、订阅自己的消息通道
    $.get(myFriendsUrl, myFriendsCallBack);
    /* $.get(myNameUrl, myNameCallBack);*/

});


function myFriendsCallBack(data) {
    /*<li><span>张三</ span> <button type="button" class="btn btn-info" style="margin: 5px 0px;">呼叫</button></li>*/
    $.each(data.result, function (i, val) {
        $("#myFriends").append('<li><span>' + val + '</span> <button type="button" class="btn btn-info" onclick="call(this)" style="margin: 5px 0px;">呼叫</button></li>');
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
        stompClient.subscribe('/topic/chat/' + myName, function (message) {
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
    stompClient.send("/app/chat/" + username, {}, JSON.stringify({'message': msg}))
}

/**
 * 发送sdp offer 或 answer
 * @param username
 * @param sdpMsg
 */
function sendSdpMsg(username, sdpMsg) {
    stompClient.send("/app/chat/" + username, {}, JSON.stringify({'sdpMessage': sdpMsg}));
}


/**
 * 申请聊天
 * @param username
 * @param type offer请求，answer同意，2拒绝,3挂机
 */
function applySdp(username, type) {
    stompClient.send("/app/chat/" + username, {}, JSON.stringify({'sdpMessage': {'type': type}}))
}

/**
 * 处理视频聊天
 */
function dealSdp(sdpMsg) {
    debugger;
    if (sdpMsg.type == 'offer') {
        $("#permit").show();
        $("#deny").show();
        rtcPeerConnection.setRemoteDescription(sdpMsg);
    } else if (sdpMsg.type == 'answer') {
        $("#hangup").show();
        rtcPeerConnection.setRemoteDescription(sdpMsg);
    } else if (sdpMsg.type == '2') {
        alert('对方拒绝你的视频请求！');
    } else if (sdpMsg.type == '3') {
        off();
    }
}

/**
 * 呼叫
 * @param obj
 */
function call(obj) {
    toUserName = $(obj).prev().text();
    rtcPeerConnection.createOffer(function (localDesc) {
        rtcPeerConnection.setLocalDescription(localDesc);
        sendSdpMsg(toUserName,localDesc);
    }, doNothing, constraints)

    $(obj).parent().parent().each(function(){
        $(this).find("button").hide();
    });
}

/**
 * 同意
 */
function permit() {
    $("#permit").hide();
    $("#deny").hide();
    $("#hangup").show();
    rtcPeerConnection.createAnswer(function (localDesc) {
        rtcPeerConnection.setLocalDescription(localDesc);
        sendSdpMsg(toUserName,localDesc);
    }, doNothing, constraints);

}

/**
 * 拒绝
 */
function deny() {
    rtcPeerConnection.setRemoteDescription(null);
    $("#permit").hide();
    $("#deny").hide();
    applySdp(toUserName,'2');
}

/**
 * 挂机
 */
function hangup() {
    applySdp(toUserName, '3');
    off();
}

/**
 * 断开视频链接
 */
function off() {
    $("#permit").hide();
    $("#deny").hide();
    $("#hangup").hide();
    yourVideoStream = null, yourVideo = null;
    rtcPeerConnection.close();
    rtcPeerConnection = null;
}


//页面加载完成执行
window.onload = function () {
    //获取本地摄像头、麦克风
    myVideo = document.getElementById("myVideo");
    yourVideo = document.getElementById("yourVideo");
    getMedia();
}

//获取本地媒体流并放到video
function getMedia() {
    getUserMedia(opt, successCallback, errorCallback);
}


function successCallback(stream) {
    myVideoStream = stream;
    attachMediaStream(myVideo, myVideoStream);
    initPeerConnect();
}

function errorCallback(error) {
    console.log("getUserMedia error: ", error);
}


/**
 * 初始化peerConnect
 */
function initPeerConnect() {
    var stunuri = false,
        turnuri = false,
        myfalse = function (v) {
            return ((v === "0") || (v === "false") || (!v));
        },
        config = new Array();


    if (stunuri) {
        // this is one of Google's public STUN servers
        config.push({
            "url": "stun:stun.l.google.com:19302",
            "urls": "stun:stun.l.google.com:19302"
        });
    }
    if (turnuri) {
        if (stunuri) {
            config.push({
                "url": "turn:user@turn.webrtcbook.com",
                "urls": "turn:turn.webrtcbook.com",
                "username": "user",
                "credential": "test"
            });
        } else {
            config.push({
                "url": "turn:user@turn-only.webrtcbook.com",
                "urls": "turn:turn-only.webrtcbook.com",
                "username": "user",
                "credential": "test"
            });
        }
    }
    console.log("config = " + JSON.stringify(config));
    rtcPeerConnection = new RTCPeerConnection({iceServers: config});
    rtcPeerConnection.onicecandidate = onIceCandidate;
    rtcPeerConnection.onaddstream = onRemoteStreamAdded;
    rtcPeerConnection.onremovestream = onRemoteStreamRemoved;
}

/**
 * ice候补配置
 * @param e
 */
function onIceCandidate(e) {

}

/**
 * 拉取远端的视频流
 * @param e
 */
function onRemoteStreamAdded(e) {
    debugger;
    alert(111);
    yourVideoStream = e.stream;
    attachMediaStream(yourVideo, yourVideoStream);

}

/**
 * 移除远端的视频流
 * @param e
 */
function onRemoteStreamRemoved(e) {

}