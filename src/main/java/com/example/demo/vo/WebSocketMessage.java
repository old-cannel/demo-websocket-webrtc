package com.example.demo.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * @Auther: liuqi
 * @Date: 2019/1/29 10:47
 * @Description: websocket 消息
 */
@Data
public class WebSocketMessage implements Serializable {
//  普通消息
    private String message;
//    发消息人用户名
    private String fromUserName;

//    是否是sdp消息
    private boolean sdpMsg;
    //    sdp消息体
    private SdpMessage sdpMessage;


}
