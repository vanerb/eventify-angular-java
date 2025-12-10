package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Post;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.ImageDTO;

import com.ubication.backend.model.Image;
import com.ubication.backend.model.Hashtag;
import com.ubication.backend.repository.UserRepository;

import com.ubication.backend.repository.PostRepository;
import com.ubication.backend.repository.ImageRepository;
import com.ubication.backend.repository.EventRepository;

import com.ubication.backend.service.ImageService;
import com.ubication.backend.dto.PostDTO;
import com.ubication.backend.dto.UserDTO;
import com.ubication.backend.dto.ThemeDTO;
import com.ubication.backend.dto.HashtagDTO;
import com.ubication.backend.dto.EventDTO;
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
    private EventRepository eventRepository;

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
       post.setCreator(user);

       // Asignar evento si viene en el DTO
       if (dto.event() != null) {
           Long eventId = dto.event().id();
           Event event = eventRepository.findById(eventId)
                   .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
           post.setEvent(event);
       }

       // Asignar hashtags
       if (dto.hashtags() != null && !dto.hashtags().isEmpty()) {
           List<Hashtag> hashtags = dto.hashtags().stream()
                   .map(t -> {
                       Hashtag hashtag = new Hashtag();
                       hashtag.setName(t.name());
                       hashtag.setPost(post);
                       return hashtag;
                   })
                   .collect(Collectors.toList());

           post.setHashtags(hashtags);
       }

       Post savedPost = repository.save(post);

       // Guardar imagen si existe
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


@Override
    public List<PostDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(post -> {
                    // --- Hashtags ---
                    List<HashtagDTO> hashtags = post.getHashtags() != null
                            ? post.getHashtags().stream()
                                  .map(h -> new HashtagDTO(h.getId(), h.getName()))
                                  .collect(Collectors.toList())
                            : Collections.emptyList();

                    // --- Imagen del post ---
                    List<Image> images = imageRepository.findByFromTypeAndFromId("POST", post.getId());
                    ImageDTO imageDTO = images.isEmpty()
                            ? null
                            : new ImageDTO(images.get(0).getId(), images.get(0).getUrl());

                    // --- Evento ---
                    EventDTO eventDTO = null;
                    Event event = post.getEvent();
                    if (event != null) {
                        // Participantes como DTO con imagen
                        List<UserDTO> participantsDTO = event.getParticipants() != null
                                ? event.getParticipants().stream()
                                      .map(u -> {
                                          List<Image> userImages = imageRepository.findByFromTypeAndFromId("USER", u.getId());
                                          ImageDTO userImageDTO = userImages.isEmpty()
                                                  ? null
                                                  : new ImageDTO(userImages.get(0).getId(), userImages.get(0).getUrl());
                                          return new UserDTO(u.getId(), u.getName(), u.getBio(), u.getUsername(), u.getEmail(), userImageDTO);
                                      })
                                      .collect(Collectors.toList())
                                : Collections.emptyList();

                        // Creador del evento como DTO con imagen
                        User creator = event.getCreator();
                        UserDTO creatorDTO = creator != null
                                ? new UserDTO(
                                        creator.getId(),
                                        creator.getName(),
                                          creator.getBio(),
                                        creator.getUsername(),
                                        creator.getEmail(),
                                        imageRepository.findByFromTypeAndFromId("USER", creator.getId()).stream()
                                                .findFirst()
                                                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                                .orElse(null)
                                )
                                : null;

                        // Temas del evento como DTO
                        List<ThemeDTO> themesDTO = event.getThemes() != null
                                ? event.getThemes().stream()
                                      .map(t -> new ThemeDTO(t.getId(), t.getName()))
                                      .collect(Collectors.toList())
                                : Collections.emptyList();

                        // Construimos EventDTO
                        eventDTO = new EventDTO(
                                event.getId(),
                                event.getInitDate(),
                                event.getEndDate(),
                                event.getPlaceId(),
                                themesDTO,
                                participantsDTO,
                                event.getUbication(),
                                event.getLatitude(),
                                event.getLongitude(),
                                event.getName(),
                                event.getDescription(),
                                event.getType(),
                                creatorDTO,
                                null  // Imagen del evento si quieres añadir
                        );
                    }

                    // --- Creador del post con imagen ---
                    User creator = post.getCreator();
                    ImageDTO creatorImageDTO = imageRepository.findByFromTypeAndFromId("USER", creator.getId()).stream()
                            .findFirst()
                            .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                            .orElse(null);

                    UserDTO userDTO = new UserDTO(
                            creator.getId(),
                            creator.getName(),
                             creator.getBio(),
                            creator.getUsername(),
                            creator.getEmail(),
                            creatorImageDTO
                    );

                    // --- Construimos PostDTO ---
                    return new PostDTO(
                            post.getId(),
                            post.getDescription(),
                            post.getUrl(),
                            hashtags,
                            eventDTO,
                            userDTO,
                            imageDTO
                    );
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
