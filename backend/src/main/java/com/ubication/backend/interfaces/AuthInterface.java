package com.ubication.backend.interfaces;

import com.ubication.backend.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface AuthInterface {
     User register(String email, String password, String name, String username, MultipartFile file);
    String login(String email, String password);
     User findUserByToken(String header);
}
