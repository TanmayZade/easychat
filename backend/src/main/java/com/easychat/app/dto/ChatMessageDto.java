package com.easychat.app.dto;

import lombok.Data;

@Data
public class ChatMessageDto {
    private String receiver;
    private String cipherText;
    private String iv;
    private String sender;
}
