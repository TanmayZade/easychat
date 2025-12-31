package com.easychat.app.controller;

import com.easychat.app.dto.ChatMessageDto;
import com.easychat.app.model.Message;
import com.easychat.app.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class WebSocketController {
    private final ChatService chatService;
    private final ModelMapper modelMapper;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageDto dto, Principal principal){
        String sender = principal.getName();
        dto.setSender(sender);

        chatService.saveMessage(dto);
        simpMessagingTemplate.convertAndSendToUser(dto.getReceiver(),"/queue/messages", dto);
        simpMessagingTemplate.convertAndSendToUser(dto.getSender(),"/queue/messages", dto);

    }
}
