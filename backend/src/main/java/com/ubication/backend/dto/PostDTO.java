package com.ubication.backend.dto;
import java.time.LocalDateTime;
import com.ubication.backend.dto.UserDTO;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.dto.HashtagDTO;
import com.ubication.backend.dto.ImageDTO;
import com.ubication.backend.dto.CommentDTO;
import java.util.List;
import com.ubication.backend.dto.ThemeDTO;

public record PostDTO(
        Long id,
        String description,
        String url,
        List<HashtagDTO> hashtags,
        EventDTO event,
        UserDTO creator,
        ImageDTO image,
        List<CommentDTO> comments
) {}
