package com.example.demo.controller;

import com.example.demo.vo.HelloMessage;
import com.example.demo.vo.SocketMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.security.Principal;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @Auther: liuqi
 * @Date: 2019/1/22 16:02
 * @Description:
 */
@Controller
public class IndexController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @RequestMapping("/")
    public String index() {
        return "index";
    }


    @MessageMapping("/hello")
    @SendToUser("/topic/hello")
    public SocketMessage greetings(HelloMessage message) throws Exception {
        SocketMessage socketMessage=new SocketMessage();
        socketMessage.setMessage("我自己才能收到,"+message.getName());
        // 发现消息
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        socketMessage.setDate(df.format(new Date()));
        return socketMessage;
    }
    @MessageMapping("/chat")
    @SendTo("/topic/chat")
    public SocketMessage chat(HelloMessage message) throws Exception {
        SocketMessage socketMessage=new SocketMessage();
        socketMessage.setMessage("大家好，聊天室都能收到,"+message.getName());
        // 发现消息
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        socketMessage.setDate(df.format(new Date()));
        return socketMessage;
    }

    @RequestMapping("/login")
    public String login(HttpServletRequest request) {
        return "login";
    }

    @RequestMapping("/mychat")
    public String mychat() {
      return "chat";
    }
    @RequestMapping("/video")
    public String video() {
        return "video";
    }

    @RequestMapping("/video-p2p")
    public String videop2p() {
        return "video-p2p";
    }
    @RequestMapping("/rtc")
    public String rtc() {
        return "webrtc/data";
    }
}
