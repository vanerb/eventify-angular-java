package com.ubication.backend.interfaces;

import com.ubication.backend.model.User;
import com.ubication.backend.dto.UserDTO;
import com.ubication.backend.dto.UpdateUserDTO;
import org.springframework.web.multipart.MultipartFile;

public interface AuthInterface {
     User register(String email, String password, String name, String username, MultipartFile file);
     User update(String authHeader, UpdateUserDTO dto, MultipartFile banner, MultipartFile profileImage);
    String login(String email, String password);
     UserDTO findUserByToken(String header);
}
