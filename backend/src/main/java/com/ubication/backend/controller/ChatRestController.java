package com.ubication.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ubication.backend.model.ChatMessage;
import com.ubication.backend.repository.ChatMessageRepository;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    @Autowired
    private ChatMessageRepository repository;

    @GetMapping("/{eventId}")
    public List<ChatMessage> getMessages(@PathVariable Long eventId) {
        return repository.findByEventIdOrderByTimestampAsc(eventId);
    }
}
