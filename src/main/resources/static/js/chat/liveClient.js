let localVideo,localStream,localPeerConnection,
    remoteVideo,remoteStream,remotePeerConnection
;

/**
 * 页面初始化加载
 */
$(function () {
     localVideo = document.getElementById("localVideo");
     remoteVideo = document.getElementById("remoteVideo");
});
/**
 * 本地视频加载
 */
window.onload=function () {
    start();
}

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