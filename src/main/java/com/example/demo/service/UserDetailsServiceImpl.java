package com.example.demo.service;

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

        return new User(username, bCryptPasswordEncoder.encode("123456"), AuthorityUtils.commaSeparatedStringToAuthorityList("user,admin"));

    }


}