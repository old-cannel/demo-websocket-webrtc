package com.example.demo.controller;

import com.example.demo.common.response.ResponseVo;
import com.example.demo.constant.UserPools;
import com.example.demo.vo.WebSocketMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @Auther: liuqi
 * @Date: 2019/1/29 08:49
 * @Description: 在线聊天服务
 */
@Controller
public class LiveChatController {
    /**
     * 进入在线聊天界面
     *
     * @return
     */
    @RequestMapping("/live")
    public String access() {
        return "live-chat";
    }

    /**
     * 我的朋友
     *
     * @return
     */
    @RequestMapping("/myFriends")
    @ResponseBody
    public ResponseVo myFriends() {
        List<String> users = UserPools.getInstance().getUsers();
        User u = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return ResponseVo.success( users.stream().filter(v ->
                !u.getUsername().equals(v)
        ).collect(Collectors.toList()));
    }
    @RequestMapping("/myName")
    @ResponseBody
    public ResponseVo myName() {
        User u = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseVo.success( u.getUsername());
    }

    /**
     * 通过用户名给用户发送消息
     * @param webSocketMessage
     * @return
     */
    @MessageMapping("/chat/{username}")
    @SendTo("/topic/chat/{username}")
    public ResponseVo chat(WebSocketMessage webSocketMessage, Principal p,@DestinationVariable("username") String username){
        if(webSocketMessage.getSdpMessage()!=null){
            webSocketMessage.setSdpMsg(true);
        }
        webSocketMessage.setFromUserName(p.getName());
        return ResponseVo.success(webSocketMessage);
    }
}
