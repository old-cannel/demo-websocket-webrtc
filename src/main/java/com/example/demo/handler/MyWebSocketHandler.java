package com.example.demo.handler;

import com.alibaba.fastjson.JSONObject;
import com.example.demo.vo.WebrtcMessage;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * @Auther: liuqi
 * @Date: 2019/3/1 17:26
 * @Description: websocket 处理类
 */
@Slf4j
public class MyWebSocketHandler extends TextWebSocketHandler {

    public static Map<String, WebSocketSession> userSocketSessionMap;

    static {

        userSocketSessionMap = new HashMap<>();

    }

    public static Map<String,String> userMapSession=new HashMap<>();
    int i = 0;

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        log.info("my websocket,{} send message:{}", session.getId(), message.getPayload());
        WebrtcMessage webrtcMessage= JSONObject.parseObject(message.getPayload(),WebrtcMessage.class);
        webrtcMessage.setFromUserName(userMapSession.get(session.getId()));
        sendMessage(session,userSocketSessionMap.get(webrtcMessage.getUsername()),webrtcMessage);

    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("{} into my websocket ", session.getId());
//        userSocketSessionMap.put(session.getId(), session);
        WebrtcMessage webrtcMessage=new WebrtcMessage();
        if (i == 0) {
            userSocketSessionMap.put("111", session);
            log.info("用户号111的会话是：{}",session.getId());
            webrtcMessage.setMessage("111建立连接");
            userMapSession.put(session.getId(),"111");
            i = 1;
        } else {
            userSocketSessionMap.put("222", session);
            log.info("用户号222的会话是：{}",session.getId());
            webrtcMessage.setMessage("222建立连接");
            userMapSession.put(session.getId(),"222");
            i = 0;
        }
//        sendMessage(null, session, "链接成功");

        webrtcMessage.setFromUserName(session.getId());

        sendMessage(null, session, webrtcMessage);
    }

    /**
     * 发送消息
     *
     * @param fromSession 发送会话
     * @param toSession   接收会话
     * @param webrtcMessage  发送内容
     */
    public void sendMessage(WebSocketSession fromSession, WebSocketSession toSession, WebrtcMessage webrtcMessage) {
        if (toSession == null && fromSession != null) {
            log.warn("接收人不能为空");
            backSend(fromSession, "接收人不能为空");
            return;
        }
        if (webrtcMessage==null && fromSession != null) {
            log.warn("发送内容不能为空");
            backSend(fromSession, "发送内容不能为空");
            return;
        }
        try {
            toSession.sendMessage(new TextMessage(JSONObject.toJSONString(webrtcMessage)));
        } catch (IOException e) {
            log.warn("消息发送给接收人IO异常，已提示发送人重新发送！");
            if (fromSession != null) {
                backSend(fromSession, "消息发送失败，请重新发送");
            }

        }
    }

    /**
     * 返回错误提示
     *
     * @param session
     * @param tip
     */
    private void backSend(WebSocketSession session, String tip) {
        try {
            session.sendMessage(new TextMessage("tip"));
        } catch (IOException e1) {
            log.error("异常系统提示发送人消息IO异常，发送人信息:{}，提示消息：{}", session.getId(), tip);
        }
    }

}
