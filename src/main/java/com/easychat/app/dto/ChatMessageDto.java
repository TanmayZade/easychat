package com.easychat.app.dto;

import lombok.Data;

@Data
public class ChatMessageDto {
    private String content;
    private String receiver;
    private String sender;
}
