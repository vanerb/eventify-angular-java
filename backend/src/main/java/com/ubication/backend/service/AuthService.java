package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.repository.UserRepository;
import com.ubication.backend.security.JwtUtil;
import com.ubication.backend.interfaces.AuthInterface;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.File;
import com.ubication.backend.model.Image;
import com.ubication.backend.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class AuthService implements AuthInterface {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    private ImageService imageService;

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public User register(String email, String password, String name, String username, MultipartFile file) {
        // 1️⃣ Crear usuario básico
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));

        // 2️⃣ Guardar usuario primero para tener un ID
        User savedUser = repository.save(user);

        // 3️⃣ Subir imagen de perfil si se proporciona
        if (file != null && !file.isEmpty()) {
            try {
                Image img = imageService.upload(file, "USER", savedUser.getId(), true);

                savedUser.setProfileImageName(img.getUrl());

                repository.save(savedUser);
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la imagen de perfil", e);
            }
        }

        return savedUser;
    }

    @Override
    public String login(String email, String password) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }

        String token = jwtUtil.generateToken(email);

        user.setToken(token);
        repository.save(user);

        return token;
    }

    @Override
    public User findUserByToken(String header) {
        String token = header.replace("Bearer ", "");

        String email = jwtUtil.extractEmail(token);

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!token.equals(user.getToken())) {
            throw new RuntimeException("Invalid token");
        }

        return user;
    }
}
