package com.example.demo.service;

import com.example.demo.constant.UserPools;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.List;

/**
 * @Auther: liuqi
 * @Date: 2019/1/10 20:51
 * @Description: 根据用户名读取用户信息，权限信息；
 */
@Slf4j
@Service
public class UserDetailsServiceImpl implements UserDetailsService, Serializable {

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("登陆用户名：{}", username);
        List<String> users=UserPools.getInstance().getUsers();
        boolean b=false;
        for(String userName:users){
            if(userName.equals(username)){
                b=true;
            }
        }
        if(!b){
            throw new UsernameNotFoundException("用户或密码不存在");
        }
        return new User(username, bCryptPasswordEncoder.encode("123456"), AuthorityUtils.commaSeparatedStringToAuthorityList("user,admin"));

    }


}