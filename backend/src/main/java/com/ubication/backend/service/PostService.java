package com.ubication.backend.service;

import com.ubication.backend.model.*;
import com.ubication.backend.dto.*;
import com.ubication.backend.repository.*;
import com.ubication.backend.security.JwtUtil;
import com.ubication.backend.interfaces.PostInterface;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService implements PostInterface {

    @Autowired private PostRepository repository;
    @Autowired private UserRepository userRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private ImageRepository imageRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private HttpServletRequest request;
    @Autowired private ImageService imageService;

    // =========================
    // CREATE
    // =========================
    @Override
    public PostDTO create(PostDTO dto, MultipartFile file) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Post post = new Post();
        post.setDescription(dto.description());
       post.setUrl(dto.url());
        post.setCreator(user);

        if (dto.event() != null) {
            Event event = eventRepository.findById(dto.event().id())
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            post.setEvent(event);
        }

        if (dto.hashtags() != null) {
            List<Hashtag> hashtags = dto.hashtags().stream()
                    .map(h -> {
                        Hashtag tag = new Hashtag();
                        tag.setName(h.name());
                        tag.setPost(post);
                        return tag;
                    })
                    .collect(Collectors.toList());
            post.setHashtags(hashtags);
        }

        Post saved = repository.save(post);

        if (file != null && !file.isEmpty()) {
            try {
                imageService.upload(file, "POST", saved.getId(), true);
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar imagen", e);
            }
        }

        return toPostDTO(saved);
    }

    // =========================
    // FIND ALL
    // =========================
    @Override
    public List<PostDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toPostDTO)
                .collect(Collectors.toList());
    }

    // =========================
    // FIND BY ID
    // =========================
    public PostDTO findById(Long id) {
        Post post = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post no encontrado"));
        return toPostDTO(post);
    }

    // =========================
    // DELETE
    // =========================
    @Transactional
    public void delete(Long id) {
        Post post = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post no encontrado"));

        imageService.deleteByFromId("POST", post.getId());
        repository.deleteById(id);
    }

    // =========================
    // HELPERS
    // =========================
    private UserDTO toUserDTO(User u) {
        ImageDTO image = imageRepository.findByFromTypeAndFromId("USER", u.getId())
                .stream().findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

        ImageDTO banner = imageRepository.findByFromTypeAndFromId("USER_BANNER", u.getId())
                .stream().findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

        return new UserDTO(
                u.getId(),
                u.getName(),
                u.getBio(),
                u.getUsername(),
                u.getEmail(),
                image,
                banner
        );
    }

    private EventDTO toEventDTO(Event e) {
        if (e == null) return null;

        List<ThemeDTO> themes = e.getThemes() != null
                ? e.getThemes().stream()
                        .map(t -> new ThemeDTO(t.getId(), t.getName()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        List<UserDTO> participants = e.getParticipants() != null
                ? e.getParticipants().stream()
                        .map(this::toUserDTO)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        ImageDTO image = imageRepository.findByFromTypeAndFromId("EVENT", e.getId())
                .stream().findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

        return new EventDTO(
                e.getId(),
                e.getInitDate(),
                e.getEndDate(),
                e.getPlaceId(),
                themes,
                participants,
                e.getUbication(),
                e.getLatitude(),
                e.getLongitude(),
                e.getName(),
                e.getDescription(),
                e.getType(),
                toUserDTO(e.getCreator()),
                image
        );
    }

    private PostDTO toPostDTO(Post post) {

        List<HashtagDTO> hashtags = post.getHashtags() != null
                ? post.getHashtags().stream()
                        .map(h -> new HashtagDTO(h.getId(), h.getName()))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        List<CommentDTO> comments = post.getComments() != null
                ? post.getComments().stream()
                        .map(c -> new CommentDTO(
                                c.getId(),
                                c.getComment(),
                                null,
                                toEventDTO(c.getEvent()),
                                toUserDTO(c.getUser()),
                                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null
                        ))
                        .collect(Collectors.toList())
                : Collections.emptyList();

        ImageDTO image = imageRepository.findByFromTypeAndFromId("POST", post.getId())
                .stream().findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

        return new PostDTO(
                post.getId(),
                post.getDescription(),
                post.getUrl(),
                hashtags,
                toEventDTO(post.getEvent()),
                toUserDTO(post.getCreator()),
                image,
                comments
        );
    }

    @Override
    public List<PostDTO> findByUserId(String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!token.equals(user.getToken())) {
            throw new RuntimeException("Invalid token");
        }


        return repository.findByCreatorId(user.getId())
                        .stream()
                        .map(this::toPostDTO)
                        .collect(Collectors.toList());
    }
}
