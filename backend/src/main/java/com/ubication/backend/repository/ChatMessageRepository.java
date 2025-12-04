package com.ubication.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ubication.backend.model.ChatMessage;


public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByEventIdOrderByTimestampAsc(Long eventId);
}
