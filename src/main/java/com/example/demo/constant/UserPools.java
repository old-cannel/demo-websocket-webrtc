package com.example.demo.constant;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * @Auther: liuqi
 * @Date: 2019/1/29 09:47
 * @Description: 模拟数据库用户
 */
@Data
public class UserPools {
    private List<String> users;
    private static UserPools userPools;
    private UserPools(){}
    public static UserPools getInstance(){
        if(userPools==null){
            userPools=new UserPools();
            userPools.setUsers(initUsers());
        }
        return userPools;
    }

    private static List<String> initUsers(){
        List<String> usernames=new ArrayList<>();
        usernames.add("111");
        usernames.add("222");
        usernames.add("333");
        usernames.add("444");
        usernames.add("555");
        usernames.add("666");
        usernames.add("777");
        usernames.add("888");
        usernames.add("999");
        usernames.add("000");

        return usernames;
    }
}
