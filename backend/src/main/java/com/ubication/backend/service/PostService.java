package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Post;
import com.ubication.backend.dto.ImageDTO;

import com.ubication.backend.model.Image;
import com.ubication.backend.repository.UserRepository;

import com.ubication.backend.repository.PostRepository;
import com.ubication.backend.repository.ImageRepository;

import com.ubication.backend.service.ImageService;
import com.ubication.backend.dto.PostDTO;

import org.springframework.stereotype.Service;

import com.ubication.backend.interfaces.PostInterface;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.io.IOException;
import com.ubication.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Collections;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService implements PostInterface {

    @Autowired
    private PostRepository repository;

    @Autowired
    private UserRepository userRepository;



    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private ImageService imageService;

    @Override
    public Post create(PostDTO dto, MultipartFile file) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Post post = new Post();

        post.setDescription(dto.description());
        post.setEvent(dto.event());
        post.setCreator(user);

        Post savedPost = repository.save(post);

        if (file != null && !file.isEmpty()) {
            try {
                imageService.upload(file, "POST", savedPost.getId(), true);
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la imagen en Image table", e);
            }
        }

        return savedPost;
    }


    public List<Post> findByUserId(String authHeader) {

        String token = authHeader.replace("Bearer ", "");

        String email = jwtUtil.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!token.equals(user.getToken())) {
            throw new RuntimeException("Invalid token");
        }

        return repository.findByCreatorId(user.getId());
    }


    public List<PostDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(e -> {


                    List<Image> images = imageRepository.findByFromTypeAndFromId("POST", e.getId());
                    ImageDTO imageDTO = images.isEmpty()
                            ? null
                            : new ImageDTO(
                                    images.get(0).getId(),
                                    images.get(0).getUrl());

                    return new PostDTO(
                            e.getId(),
                            e.getDescription(),
                            e.getEvent(),
                            e.getCreator(),
                            imageDTO);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        Post post = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post no encontrado"));

        imageService.deleteByFromId("POST", post.getId());
        repository.deleteById(post.getId());
    }
}
