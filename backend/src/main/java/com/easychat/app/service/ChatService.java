package com.easychat.app.service;

import com.easychat.app.dto.ChatMessageDto;
import com.easychat.app.model.Message;
import com.easychat.app.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MessageRepository messageRepository;
    private final ModelMapper modelMapper;
    public Message saveMessage(ChatMessageDto chatMessageDto){
        Message message = modelMapper.map(chatMessageDto, Message.class);
        return messageRepository.save(message);
    }

    public List<ChatMessageDto> getChatHistory(String user1, String user2){
        List<Message> messages = messageRepository.findBySenderAndReceiverOrSenderAndReceiverOrderByTimestampAsc(user1, user2, user2, user1);

        return messages.stream()
                .map(message -> modelMapper.map(message, ChatMessageDto.class))
                .toList();
    }

    public List<String> getChatContacts(String currentUser) {
        List<String> contacts = messageRepository.findChatContacts(currentUser);
        return contacts == null ? List.of() : contacts;
    }

}
