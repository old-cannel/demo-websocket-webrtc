package com.example.demo.controller;

import com.example.demo.vo.SignalingMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.WebSocketSession;

/**
 * @Auther: liuqi
 * @Date: 2019/1/26 09:19
 * @Description: 信令服务
 */
@Controller
public class SignalingController {

    /**
     * 通过房间号建立每个浏览器与服务器的数据通道
     * 订阅这个房间号的人都可以收到消息
     *
     * @param room
     * @return
     */
    @MessageMapping("/connect/{room}")
    @SendTo("/topic/connect/{room}")
    public SignalingMessage connect(@DestinationVariable("room") String room, SignalingMessage signalingMessage, StompHeaderAccessor stompHeaderAccessor) {
        signalingMessage.setMessage(stompHeaderAccessor.getSessionId()+"说："+signalingMessage.getMessage());
        signalingMessage.setRoom(room);
        signalingMessage.setSessionId(stompHeaderAccessor.getSessionId());
        return signalingMessage;
    }

    @MessageMapping("/sessionId")
    @SendToUser("/topic/sessionId")
    public String getSessionId(StompHeaderAccessor stompHeaderAccessor){
        return stompHeaderAccessor.getSessionId();
    }
}
