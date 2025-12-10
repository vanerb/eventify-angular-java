package com.ubication.backend.dto;
import java.time.LocalDateTime;
import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.ImageDTO;
import java.util.List;
import com.ubication.backend.dto.ThemeDTO;

public record PostDTO(
        Long id,
        String description,
        Event event,
        User creator,
        ImageDTO image
) {}
