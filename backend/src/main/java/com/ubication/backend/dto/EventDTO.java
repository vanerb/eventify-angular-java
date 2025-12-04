package com.ubication.backend.dto;
import java.time.LocalDateTime;
import com.ubication.backend.model.User;
import com.ubication.backend.dto.ImageDTO;
import java.util.List;
import com.ubication.backend.dto.ThemeDTO;

public record EventDTO(
        Long id,
        LocalDateTime initDate,
        LocalDateTime endDate,
        String placeId,
        List<ThemeDTO> themes,
        List<User> participants,
        String ubication,
        Double latitude,
        Double longitude,
        String name,
        String description,
        String type,
        User creator,
        ImageDTO image
) {}
