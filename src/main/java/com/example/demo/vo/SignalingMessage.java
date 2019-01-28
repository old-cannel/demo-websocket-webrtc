package com.example.demo.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * @Auther: liuqi
 * @Date: 2019/1/22 16:19
 * @Description: 信令消息
 */
@Data
public class SignalingMessage implements Serializable {
//    浏览器会话id
    private String sessionId;
//    消息
    private String message;
//    信令通道密钥
    private String room;
//sdp消息
    private SdpMessage sdpMessage;


}
