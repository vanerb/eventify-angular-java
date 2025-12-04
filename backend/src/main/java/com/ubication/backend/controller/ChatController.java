package com.ubication.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

import com.ubication.backend.model.ChatMessage;
import com.ubication.backend.repository.ChatMessageRepository; // <<--- IMPORT IMPORTANTE

@Controller
public class ChatController {

    @Autowired
    private ChatMessageRepository repository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

     @Autowired
     private ChatMessageRepository chatMessageRepository; // <<--- ahora reconoce la clase

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessage message) {

        message.setTimestamp(LocalDateTime.now());

        // Guardar en DB
        repository.save(message);

        // Enviar a los conectados en el evento
        messagingTemplate.convertAndSend(
            "/topic/event/" + message.getEventId(),
            message
        );
    }
}
