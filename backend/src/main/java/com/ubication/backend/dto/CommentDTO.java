package com.ubication.backend.dto;
import java.time.LocalDateTime;
import com.ubication.backend.model.User;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.dto.UserDTO;
import java.util.List;
import com.ubication.backend.dto.PostDTO;

public record CommentDTO(
           Long id,
             String comment,
             PostDTO post,
             EventDTO event,
              UserDTO user,
             String createdAt
) {}
