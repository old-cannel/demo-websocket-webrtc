package com.example.demo.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * @Auther: liuqi
 * @Date: 2019/1/28 09:26
 * @Description: sdp消息
 */
@Data
public class SdpMessage implements Serializable {
    //类型
    private String type;
    //sdp
    private String sdp;

}
