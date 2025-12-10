package com.ubication.backend.dto;
import java.time.LocalDateTime;
import com.ubication.backend.dto.PostDTO;
import java.util.List;

public record HashtagDTO(
        Long id,
        String name
) {}
