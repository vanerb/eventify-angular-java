package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Post;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.ImageDTO;

import com.ubication.backend.model.Image;
import com.ubication.backend.model.Hashtag;
import com.ubication.backend.model.Comment;
import com.ubication.backend.repository.UserRepository;

import com.ubication.backend.repository.PostRepository;
import com.ubication.backend.repository.ImageRepository;
import com.ubication.backend.repository.EventRepository;

import com.ubication.backend.service.ImageService;
import com.ubication.backend.dto.PostDTO;
import com.ubication.backend.dto.UserDTO;
import com.ubication.backend.dto.ThemeDTO;
import com.ubication.backend.dto.CommentDTO;
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
import java.util.ArrayList;

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


                     // --- Comentarios ---


                     List<CommentDTO> comments = new ArrayList<>();

                     if (post.getComments() != null) {
                         comments = post.getComments().stream()
                                 .map(c -> {

                                     // --- PostDTO del comentario ---
                                     PostDTO postDTO = c.getPost() != null ? new PostDTO(
                                             c.getPost().getId(),
                                             c.getPost().getDescription(),
                                             c.getPost().getUrl(),
                                             c.getPost().getHashtags() != null
                                                     ? c.getPost().getHashtags().stream()
                                                           .map(h -> new HashtagDTO(h.getId(), h.getName()))
                                                           .collect(Collectors.toList())
                                                     : new ArrayList<>(),
                                             null, // event si quieres mapearlo aquí
                                             c.getPost().getCreator() != null
                                                     ? new UserDTO(
                                                             c.getPost().getCreator().getId(),
                                                             c.getPost().getCreator().getName(),
                                                             c.getPost().getCreator().getBio(),
                                                             c.getPost().getCreator().getUsername(),
                                                             c.getPost().getCreator().getEmail(),
                                                             imageRepository.findByFromTypeAndFromId("USER", c.getPost().getCreator().getId()).stream()
                                                                     .findFirst()
                                                                     .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                                                     .orElse(null)
                                                       )
                                                     : null,
                                             imageRepository.findByFromTypeAndFromId("POST", c.getPost().getId()).stream()
                                                     .findFirst()
                                                     .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                                     .orElse(null),
                                             null  // comentarios dentro del post (evitar recursión infinita)
                                     ) : null;

                                     // --- EventDTO del comentario ---
                                     EventDTO eventDTO = c.getEvent() != null ? new EventDTO(
                                             c.getEvent().getId(),
                                             c.getEvent().getInitDate(),
                                             c.getEvent().getEndDate(),
                                             c.getEvent().getPlaceId(),
                                             c.getEvent().getThemes() != null
                                                     ? c.getEvent().getThemes().stream()
                                                           .map(t -> new ThemeDTO(t.getId(), t.getName()))
                                                           .collect(Collectors.toList())
                                                     : new ArrayList<>(),
                                             c.getEvent().getParticipants() != null
                                                     ? c.getEvent().getParticipants().stream()
                                                           .map(u -> new UserDTO(
                                                                   u.getId(),
                                                                   u.getName(),
                                                                   u.getBio(),
                                                                   u.getUsername(),
                                                                   u.getEmail(),
                                                                   imageRepository.findByFromTypeAndFromId("USER", u.getId()).stream()
                                                                           .findFirst()
                                                                           .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                                                           .orElse(null)
                                                           ))
                                                           .collect(Collectors.toList())
                                                     : new ArrayList<>(),
                                             c.getEvent().getUbication(),
                                             c.getEvent().getLatitude(),
                                             c.getEvent().getLongitude(),
                                             c.getEvent().getName(),
                                             c.getEvent().getDescription(),
                                             c.getEvent().getType(),
                                             c.getEvent().getCreator() != null
                                                     ? new UserDTO(
                                                             c.getEvent().getCreator().getId(),
                                                             c.getEvent().getCreator().getName(),
                                                             c.getEvent().getCreator().getBio(),
                                                             c.getEvent().getCreator().getUsername(),
                                                             c.getEvent().getCreator().getEmail(),
                                                             imageRepository.findByFromTypeAndFromId("USER", c.getEvent().getCreator().getId()).stream()
                                                                     .findFirst()
                                                                     .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                                                     .orElse(null)
                                                       )
                                                     : null,
                                             imageRepository.findByFromTypeAndFromId("EVENT", c.getEvent().getId()).stream()
                                                     .findFirst()
                                                     .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                                     .orElse(null)
                                     ) : null;

                                     // --- UserDTO del comentario ---
                                     UserDTO userDTO = c.getUser() != null ? new UserDTO(
                                             c.getUser().getId(),
                                             c.getUser().getName(),
                                             c.getUser().getBio(),
                                             c.getUser().getUsername(),
                                             c.getUser().getEmail(),
                                             imageRepository.findByFromTypeAndFromId("USER", c.getUser().getId()).stream()
                                                     .findFirst()
                                                     .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                                     .orElse(null)
                                     ) : null;

                                     // --- Crear CommentDTO ---
                                     return new CommentDTO(
                                             c.getId(),
                                             c.getComment(),
                                             postDTO,
                                             eventDTO,
                                             userDTO,
                                             c.getCreatedAt() != null ? c.getCreatedAt().toString() : null
                                     );
                                 })
                                 .collect(Collectors.toList());
                     }

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


                        List<Image> imageEvent = imageRepository.findByFromTypeAndFromId("EVENT", event.getId());
                        ImageDTO imageEventDTO = imageEvent.isEmpty() ? null  : new ImageDTO(imageEvent.get(0).getId(), imageEvent.get(0).getUrl());

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
                                imageEventDTO
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
                            imageDTO,
                            comments
                    );
                })
                .collect(Collectors.toList());
    }


public PostDTO findById(Long id) {
    Post post = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post no encontrado"));

    // --- Hashtags ---
    List<HashtagDTO> hashtags = post.getHashtags() != null
            ? post.getHashtags().stream()
                  .map(h -> new HashtagDTO(h.getId(), h.getName()))
                  .collect(Collectors.toList())
            : Collections.emptyList();

    // --- Comentarios ---
    List<CommentDTO> comments = new ArrayList<>();
    if (post.getComments() != null) {
        comments = post.getComments().stream()
                .map(c -> {
                    // Aquí puedes mapear post, event y user como en findAll()
                    PostDTO postDTO = null; // opcional si no quieres mapear recursivamente
                    EventDTO eventDTO = null;
                    if (c.getEvent() != null) {
                        eventDTO = new EventDTO(
                                c.getEvent().getId(),
                                c.getEvent().getInitDate(),
                                c.getEvent().getEndDate(),
                                c.getEvent().getPlaceId(),
                                c.getEvent().getThemes() != null
                                        ? c.getEvent().getThemes().stream()
                                              .map(t -> new ThemeDTO(t.getId(), t.getName()))
                                              .collect(Collectors.toList())
                                        : new ArrayList<>(),
                                c.getEvent().getParticipants() != null
                                        ? c.getEvent().getParticipants().stream()
                                              .map(u -> new UserDTO(
                                                      u.getId(),
                                                      u.getName(),
                                                      u.getBio(),
                                                      u.getUsername(),
                                                      u.getEmail(),
                                                      imageRepository.findByFromTypeAndFromId("USER", u.getId()).stream()
                                                              .findFirst()
                                                              .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                                              .orElse(null)
                                              ))
                                              .collect(Collectors.toList())
                                        : new ArrayList<>(),
                                c.getEvent().getUbication(),
                                c.getEvent().getLatitude(),
                                c.getEvent().getLongitude(),
                                c.getEvent().getName(),
                                c.getEvent().getDescription(),
                                c.getEvent().getType(),
                                null,
                                null
                        );
                    }

                    UserDTO userDTO = c.getUser() != null ? new UserDTO(
                            c.getUser().getId(),
                            c.getUser().getName(),
                            c.getUser().getBio(),
                            c.getUser().getUsername(),
                            c.getUser().getEmail(),
                            imageRepository.findByFromTypeAndFromId("USER", c.getUser().getId()).stream()
                                    .findFirst()
                                    .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                    .orElse(null)
                    ) : null;

                    return new CommentDTO(
                            c.getId(),
                            c.getComment(),
                            postDTO,
                            eventDTO,
                            userDTO,
                            c.getCreatedAt() != null ? c.getCreatedAt().toString() : null
                    );
                })
                .collect(Collectors.toList());
    }

    // --- Imagen del post ---
    List<Image> images = imageRepository.findByFromTypeAndFromId("POST", post.getId());
    ImageDTO imageDTO = images.isEmpty() ? null : new ImageDTO(images.get(0).getId(), images.get(0).getUrl());

    // --- Evento ---
    EventDTO eventDTO = null;
    Event event = post.getEvent();
    if (event != null) {
        List<UserDTO> participantsDTO = event.getParticipants() != null
                ? event.getParticipants().stream()
                      .map(u -> {
                          ImageDTO userImageDTO = imageRepository.findByFromTypeAndFromId("USER", u.getId()).stream()
                                  .findFirst()
                                  .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                                  .orElse(null);
                          return new UserDTO(u.getId(), u.getName(), u.getBio(), u.getUsername(), u.getEmail(), userImageDTO);
                      })
                      .collect(Collectors.toList())
                : Collections.emptyList();

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

        List<ThemeDTO> themesDTO = event.getThemes() != null
                ? event.getThemes().stream().map(t -> new ThemeDTO(t.getId(), t.getName())).collect(Collectors.toList())
                : Collections.emptyList();

        ImageDTO imageEventDTO = imageRepository.findByFromTypeAndFromId("EVENT", event.getId()).stream()
                .findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

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
                imageEventDTO
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
            imageDTO,
            comments
    );
}




    @Transactional
    public void delete(Long id) {
        Post post = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post no encontrado"));

        imageService.deleteByFromId("POST", post.getId());
        repository.deleteById(post.getId());
    }
}
