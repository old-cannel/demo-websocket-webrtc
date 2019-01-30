/*live chat client samples*/
//stomp 服务地址
const
    //socker 地址
    websocketUrl = 'my-websocket',
    //我的朋友
    myFriendsUrl = '/myFriends',
    //我的用户名
    myNameUrl = '/myName',
    //发送消息
    sendUrl = '/app/chat/',
    // 订阅消息
    topicUrl = '/topic/chat/';
let
    //客户端
    stompClient = null,
    //我的用户名（系统唯一）
    myName = null,
    //发送用户名（系统唯一）
    toUserName = null;


//webrtc 变量
let localVideo,localStream,peerConnection,
    remoteVideo,remoteStream,
constraints = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
}
;

/**
 * 页面初始化加载
 */
$(function () {
     localVideo = document.getElementById("localVideo");
     remoteVideo = document.getElementById("remoteVideo");

    //好友、用户信息、订阅自己的消息通道
    $.get(myFriendsUrl, myFriendsCallBack);
    $.get(myNameUrl, myNameCallBack);
});
/**
 * 本地视频加载
 */
window.onload=function () {
    start();
}

/**webrtc 操作 start**/
/**
 * 本地视频读取并渲染
 */
function start() {
    getUserMedia({audio:true, video:true}, gotStream,
        function(error) {
            trace("getUserMedia error: ", error);
        });
}
/**
 * 本地音视频渲染到localVideo
 * @param stream
 */
function gotStream(stream){
    localStream = stream;
    attachMediaStream(localVideo, localStream);

}


/**
 * 用户呼叫
 * 创建peerConnection
 */
function call(obj) {
    toUserName = $(obj).prev().text();
    callHide();
    buttonShow($("#hangupButton"));

    if (localStream.getVideoTracks().length > 0) {
        trace('Using video device: ' + localStream.getVideoTracks()[0].label);
    }
    if (localStream.getAudioTracks().length > 0) {
        trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
    }
    //ice服务器配置

    peerConnection = new RTCPeerConnection({iceServers: configIce()});
    peerConnection.addStream(localStream);
    //呼叫方ice发送
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;

    applySdp(toUserName,'call');
}
/**
 * 收到呼叫请求
 */
function receiveCall() {
    buttonShow("#denyButton");
    buttonShow("#permitButton");
}
/**
 * 同意
 */
function permit() {
    buttonHide("#denyButton");
    buttonHide("#permitButton");
    buttonShow($("#hangupButton"));

    peerConnection = new RTCPeerConnection({iceServers: configIce()});
    peerConnection.addStream(localStream);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    offer();

}
/**
 * 同意并发送offer
 */
function offer() {
    peerConnection.createOffer(gotDescription,handleError,constraints);
}
/**
 * 发送sdp
 * @param description
 */
function gotDescription(description){
    peerConnection.setLocalDescription(description);
    //给对方发送 sdp
    sendSdpMsg(toUserName,description);
}
 /* 收到offer sdp
 */
function receiveOffer(offerDescption) {
    peerConnection.setRemoteDescription(offerDescption);
    peerConnection.createAnswer(gotDescription,handleError,constraints);
}

/**
 * 收到answer sdp
 */
function receiveAnswer(answerDescption) {
    peerConnection.setRemoteDescription(answerDescption);
    peerConnection.setRemoteDescription(answerDescption);
    //没有完成链接就重新发起链接
    if(peerConnection.iceConnectionState!='connected'){
        offer();
    }
}









/**
 * 拒绝
 */
function deny(isSend) {
    if(peerConnection!=null){
        peerConnection.close();
        peerConnection = null;
    }


    buttonHide("#hangupButton");
    buttonHide("#denyButton");
    buttonHide("#permitButton");
    callShow();
// 通知对方拒绝通话
    if(isSend){
        applySdp(toUserName,'deny');
    }

}

function hangup() {

}
/**
 * 挂机
 */
function hangup(isSend) {
    //    通知对方挂断
    if(isSend){
        applySdp(toUserName,'hangup');
    }

    if(peerConnection!=null){
        peerConnection.close();
        peerConnection = null;
    }

    buttonHide($("#hangupButton"));
    callShow();


}

/**
 * 接收远端的视频流并渲染到remoteVoide
 * @param event
 */
function gotRemoteStream(event){
    remoteStream = event.stream;
    attachMediaStream(remoteVideo, remoteStream);
}
function gotIceCandidate(event){
    if (event.candidate) {
        sendSdpMsg(toUserName,event.candidate);
    }
}

/**
 * 接收ice
 * @param event
 */
function setIceCandidate(candidate,peerConnection) {
    if(peerConnection!=null&&peerConnection!='undefine'){
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        trace("ICE candidate: \n" + candidate.candidate);
    }
    trace("peerConnect is undefine or null");

}
function configIce() {
    var stunuri = true,
        turnuri = false,
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
    trace("config = " + JSON.stringify(config));
    return config;
}


function handleError(){}
/**webrtc 操作 end**/

/**
 * 处理sdpMsg消息
 */
function dealSdp(sdpMsg) {
    if (sdpMsg.type == 'call') {
        receiveCall();
    } /*else if (sdpMsg.type == 'permit') {
        receivePermit();
    }*/ else if (sdpMsg.type == 'offer') {
        receiveOffer(sdpMsg);
    } else if (sdpMsg.type == 'answer') {
        receiveAnswer(sdpMsg);
    }else if (sdpMsg.type == 'deny') {
        deny();
    }
    else if (sdpMsg.type == 'hangup') {
        hangup();
    } else if (sdpMsg.type == 'candidate') {
        setIceCandidate(sdpMsg,remotePeerConnection);
    }

}
/**stomp 操作 start**/

/**
 * 我的好友信息渲染
 * @param data
 */
function myFriendsCallBack(data) {
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
 * @param type offer请求，answer同意，deny拒绝,hangup挂机 ，permit同意
 */
function applySdp(username, type) {
    stompClient.send(sendUrl + username, {}, JSON.stringify({'sdpMessage': {'type': type}}))
}



/**stomp 操作end**/

/**
 * 格式化日志
 * @param text
 */
function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}
/**按钮样式控制**/
/**
 * 呼叫隐藏
 * @param obj
 */
function callHide(){
    $("#myFriends").each(function(){
        $(this).find("button").hide();
    });
}

/**
 * 呼叫显示
 * @param obj
 */
function callShow(){
    $("#myFriends").each(function(){
        $(this).find("button").show();
    });
}

/**
 * 隐藏
 * @param obj
 */
function buttonHide(obj){
    $(obj).hide();
}

/**
 * 显示
 * @param obj
 */
function buttonShow(obj){
    $(obj).show();
}