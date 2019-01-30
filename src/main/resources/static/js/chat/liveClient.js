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
let localVideo,localStream,localPeerConnection,
    remoteVideo,remoteStream,remotePeerConnection
;

/**
 * 页面初始化加载
 */
$(function () {
     localVideo = document.getElementById("localVideo");
     remoteVideo = document.getElementById("remoteVideo");

    //好友、用户信息、订阅自己的消息通道
    // $.get(myFriendsUrl, myFriendsCallBack);
    // $.get(myNameUrl, myNameCallBack);
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
    trace("Requesting local stream");
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
    trace("Received local stream");
    localStream = stream;
    attachMediaStream(localVideo, localStream);

}


/**
 * 用户呼叫
 * 创建peerConnection
 */
function call() {
    trace("Starting call");
    callHide();
    // buttonShow($("#hangupButton"));
    buttonShow("#denyButton");
    buttonShow("#permitButton");

    if (localStream.getVideoTracks().length > 0) {
        trace('Using video device: ' + localStream.getVideoTracks()[0].label);
    }
    if (localStream.getAudioTracks().length > 0) {
        trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
    }
    //ice服务器配置
    var servers = null;

    localPeerConnection = new RTCPeerConnection(servers);
    trace("Created local peer connection object localPeerConnection");
    //呼叫方ice发送
    localPeerConnection.onicecandidate = gotLocalIceCandidate;

}


function permit() {
    buttonHide("#denyButton");
    buttonHide("#permitButton");
    buttonShow($("#hangupButton"));

    var servers = null;
    remotePeerConnection = new RTCPeerConnection(servers);
    trace("Created remote peer connection object remotePeerConnection");
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
    remotePeerConnection.onaddstream = gotRemoteStream;

    localPeerConnection.addStream(localStream);
    trace("Added localStream to localPeerConnection");
    localPeerConnection.createOffer(gotLocalDescription,handleError);
    
}
function gotLocalDescription(description){
    localPeerConnection.setLocalDescription(description);
    trace("Offer from localPeerConnection: \n" + description.sdp);
    remotePeerConnection.setRemoteDescription(description);
    remotePeerConnection.createAnswer(gotRemoteDescription,handleError);
}

function gotRemoteDescription(description){
    remotePeerConnection.setLocalDescription(description);
    trace("Answer from remotePeerConnection: \n" + description.sdp);
    localPeerConnection.setRemoteDescription(description);
}

/**
 * 拒绝
 */
function deny() {

    localPeerConnection.close();
    localPeerConnection = null;
    buttonHide("#hangupButton");
    buttonHide("#denyButton");
    buttonHide("#permitButton");
    callShow();
    trace("Denying call");

//    todo 通知对方
}

/**
 * 挂机
 */
function hangup() {
    trace("Ending call");
    localPeerConnection.close();
    remotePeerConnection.close();
    localPeerConnection = null;
    remotePeerConnection = null;
    buttonHide($("#hangupButton"));
    callShow();
//    todo 通知对方

}

function gotRemoteStream(event){
    remoteStream = event.stream;
    attachMediaStream(remoteVideo, remoteStream);
    trace("Received remote stream");
}

/**
 * 发送Ice
 * @param event
 */
function gotLocalIceCandidate(event){
    if (event.candidate) {
        setIceCandidate(event.candidate,remotePeerConnection);
    }
}


/**
 * 被呼叫方ice打洞
 * @param event
 */
function gotRemoteIceCandidate(event){
    if (event.candidate) {
        setIceCandidate(event.candidate,localPeerConnection);
    }
}
/**
 * 接收ice
 * @param event
 */
function setIceCandidate(candidate,peerConnection) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    trace("ICE candidate: \n" + candidate.candidate);
}


function handleError(){}
/**webrtc 操作 end**/
/**stomp 操作 start**/

/**
 * 我的好友信息渲染
 * @param data
 */
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