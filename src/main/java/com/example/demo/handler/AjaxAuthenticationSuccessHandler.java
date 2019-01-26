package com.example.demo.handler;

import com.alibaba.fastjson.JSONObject;
import com.example.demo.common.response.ResponseVo;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @Auther: liuqi
 * @Date: 2019/1/10 20:07
 * @Description: 登录成功
 */
@Component
public class AjaxAuthenticationSuccessHandler implements AuthenticationSuccessHandler {


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        response.setContentType("application/json; charset=utf-8");
        response.getWriter().write(JSONObject.toJSONString(ResponseVo.success("登录成功")));
    }
}