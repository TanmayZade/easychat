package com.easychat.app.controller;

import com.easychat.app.dto.ChatMessageDto;
import com.easychat.app.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;


import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @RequestMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(@RequestParam String otherUser, Authentication authentication){
        String currentUser = authentication.getName();
        System.out.println("AUTH USER = " + authentication.getName());
        System.out.println("OTHER USER = " + otherUser);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(chatService.getChatHistory(currentUser, otherUser));
    }


}
