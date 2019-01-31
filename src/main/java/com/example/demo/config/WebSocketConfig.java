package com.example.demo.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * @Auther: liuqi
 * @Date: 2019/1/22 16:08
 * @Description:
 */
@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/my-websocket").withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {

        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                log.info("---------所有websocket请求会被拦截-----------");
                //添加只能订阅自己消息的验证
                if ("SUBSCRIBE".equals(((SimpMessageType) message.getHeaders().get("simpMessageType")).name())) {
                    //会话里面的用户名
                    String sessionUserName = ((User) ((UsernamePasswordAuthenticationToken) message.getHeaders().get("simpUser")).getPrincipal()).getUsername();
                    log.info("获取会话里面的用户名：{}", sessionUserName);
                    if (!("/topic/chat/" + sessionUserName).equals(message.getHeaders().get("simpDestination"))) {
                        return null;
                    }
                }


                return message;
            }
        });

    }
}