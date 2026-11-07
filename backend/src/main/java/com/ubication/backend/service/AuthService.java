package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Image;

import com.ubication.backend.dto.UserDTO;
import com.ubication.backend.dto.UpdateUserDTO;
import com.ubication.backend.dto.ImageDTO;

import com.ubication.backend.repository.UserRepository;
import com.ubication.backend.repository.ImageRepository;

import com.ubication.backend.security.JwtUtil;
import com.ubication.backend.interfaces.AuthInterface;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Service
public class AuthService implements AuthInterface {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    private ImageService imageService;

    @Autowired
    private ImageRepository imageRepository;

    public AuthService(UserRepository repository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // =========================
    // REGISTER
    // =========================
    @Override
    public UserDTO register(String email, String password, String name, String username, MultipartFile file) {

        if (repository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));

        User savedUser = repository.save(user);

        if (file != null && !file.isEmpty()) {
            try {
                imageService.upload(file, "USER", savedUser.getId(), true);
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar imagen de perfil", e);
            }
        }
        return toUserDto(savedUser);
    }

    // =========================
    // UPDATE USER
    // =========================
    @Override
    @Transactional
    public UserDTO update(String authHeader, UpdateUserDTO dto, MultipartFile banner, MultipartFile profileImage) {

        String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);

            // Buscar usuario
            User user = repository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setName(dto.name());
        user.setBio(dto.bio());
        user.setUsername(dto.username());

        if (dto.password() != null && !dto.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.password()));
        }

        try {
            if (profileImage != null && !profileImage.isEmpty()) {
                imageService.deleteByFromId("USER", user.getId());
                imageService.upload(profileImage, "USER", user.getId(), true);
            }

            if (banner != null && !banner.isEmpty()) {
                imageService.deleteByFromId("USER_BANNER", user.getId());
                imageService.upload(banner, "USER_BANNER", user.getId(), true);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error al actualizar imágenes", e);
        }

        repository.save(user);

        return toUserDto(user);
    }

    // =========================
    // LOGIN
    // =========================
    @Override
    public String login(String email, String password) {

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
        }

        String token = jwtUtil.generateToken(email);
        user.setToken(token);
        repository.save(user);

        return token;
    }

    // =========================
    // FIND USER BY TOKEN
    // =========================
    @Override
    public UserDTO findUserByToken(String header) {

        String token = header.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida"));

        if (!token.equals(user.getToken())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida");
        }

       return toUserDto(user);
    }


    // =========================
    // CONVERT USER TO UserDTO
    // =========================
    private UserDTO toUserDto(User user) {
        ImageDTO profile = imageRepository.findByFromTypeAndFromId("USER", user.getId())
                .stream()
                .findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

        ImageDTO banner = imageRepository.findByFromTypeAndFromId("USER_BANNER", user.getId())
                .stream()
                .findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getBio(),
                user.getUsername(),
                user.getEmail(),
                profile,
                banner
        );
    }
}
