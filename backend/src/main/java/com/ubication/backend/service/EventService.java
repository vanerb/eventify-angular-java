package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.model.Theme;
import com.ubication.backend.model.Image;

import com.ubication.backend.dto.ImageDTO;
import com.ubication.backend.dto.UserDTO;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.dto.ThemeDTO;

import com.ubication.backend.repository.UserRepository;
import com.ubication.backend.repository.EventRepository;
import com.ubication.backend.repository.ThemeRepository;
import com.ubication.backend.repository.ImageRepository;

import com.ubication.backend.security.JwtUtil;
import com.ubication.backend.interfaces.EventInterface;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageImpl;

@Service
public class EventService implements EventInterface {

    @Autowired
    private EventRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ThemeRepository themeRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private ImageService imageService;

    // =========================
    // CREATE
    // =========================
    @Override
    public EventDTO create(EventDTO dto, MultipartFile file) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Event event = new Event();
        event.setName(dto.name());
        event.setDescription(dto.description());
        event.setType(dto.type());
        event.setInitDate(dto.initDate());
        event.setEndDate(dto.endDate());
        event.setPlaceId(dto.placeId());
        event.setUbication(dto.ubication());
        event.setLatitude(dto.latitude());
        event.setLongitude(dto.longitude());
        event.setCreator(user);

        if (dto.themes() != null && !dto.themes().isEmpty()) {
            List<Theme> themes = dto.themes().stream()
                    .map(t -> {
                        Theme theme = new Theme();
                        theme.setName(t.name());
                        theme.setEvent(event);
                        return theme;
                    })
                    .collect(Collectors.toList());
            event.setThemes(themes);
        }

        Event savedEvent = repository.save(event);

        if (file != null && !file.isEmpty()) {
            try {
                imageService.upload(file, "EVENT", savedEvent.getId(), true);
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la imagen", e);
            }
        }

        return toEventDTO(savedEvent);
    }

    // =========================
    // UPDATE
    // =========================
   @Override
   @Transactional
   public EventDTO update(Long eventId, EventDTO dto, MultipartFile file) {
       String token = request.getHeader("Authorization").replace("Bearer ", "");
       String email = jwtUtil.extractEmail(token);

       User user = userRepository.findByEmail(email)
               .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

       Event event = repository.findById(eventId)
               .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

       // Actualizar campos
       event.setName(dto.name());
       event.setDescription(dto.description());
       event.setType(dto.type());
       event.setInitDate(dto.initDate());
       event.setEndDate(dto.endDate());
       event.setPlaceId(dto.placeId());
       event.setUbication(dto.ubication());
       event.setLatitude(dto.latitude());
       event.setLongitude(dto.longitude());
       event.setCreator(user);

       themeRepository.deleteByEventId(eventId);

       if (dto.themes() != null && !dto.themes().isEmpty()) {
           List<Theme> themes = dto.themes().stream()
                   .map(t -> {
                       Theme theme = new Theme();
                       theme.setName(t.name());
                       theme.setEvent(event);
                       return theme;
                   })
                   .collect(Collectors.toList());
           event.setThemes(themes);
       }

       Event savedEvent = repository.save(event);

       if (file != null && !file.isEmpty()) {
           imageService.deleteByFromId("EVENT", savedEvent.getId());
           try {
               imageService.upload(file, "EVENT", savedEvent.getId(), true);
           } catch (IOException e) {
               throw new RuntimeException("Error al guardar la imagen", e);
           }
       }

       // Devuelve DTO limpio para evitar ciclos
       return toEventDTO(savedEvent);
   }


    // =========================
       // JOIN EVENT
       // =========================
       @Override
       public EventDTO joinEvent(Long eventId, Long userId) {
           Event event = repository.findById(eventId)
                   .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

           User user = userRepository.findById(userId)
                   .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

           if (!event.getParticipants().contains(user)) {
               event.getParticipants().add(user);
               user.getJoinedEvents().add(event);
               userRepository.save(user);
           }

           return toEventDTO(event);
       }


    @Override
    public Page<EventDTO> findByUserId(String authHeader, int page, int size) {

        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        return repository.findByCreatorId(user.getId(), pageable)
                .map(this::toEventDTO);
    }

    // =========================
    // USERS BY EVENT
    // =========================
    @Override
    public Page<UserDTO> getUsersByEvent(Long eventId, Pageable pageable) {
        Event event = repository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

            List<UserDTO> users = event.getParticipants()
                    .stream()
                    .map(this::toUserDTO)
                    .toList();

            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), users.size());

            List<UserDTO> pageContent = users.subList(start, end);

            return new PageImpl<>(pageContent, pageable, users.size());
    }

    // =========================
    // FIND MY PARTICIPATIONS
    // =========================
    public Page<EventDTO> findMyEventParticipations( String header,
                                                            int page,
                                                            int size,
                                                            String search) {
           String token = header.replace("Bearer ", "");
             String email = jwtUtil.extractEmail(token);

             User user = userRepository.findByEmail(email)
                     .orElseThrow(() -> new RuntimeException("User not found"));

             if (!token.equals(user.getToken())) {
                 throw new RuntimeException("Invalid token");
             }

             Pageable pageable = PageRequest.of(page, size);

             Page<Event> events;

             if (search != null && !search.trim().isEmpty()) {
                 events = repository.findByParticipantsIdAndNameContainingIgnoreCase(
                         user.getId(),
                         search,
                         pageable
                 );
             } else {
                 events = repository.findAllByParticipantsId(
                         user.getId(),
                         pageable
                 );
             }

             return events.map(this::toEventDTO);
    }

    // =========================
    // FIND ALL
    // =========================
    public Page<EventDTO> findAll(int page, int size) {
       Pageable pageable = PageRequest.of(page, size);

           return repository.findAll(pageable)
                   .map(this::toEventDTO);
    }

    // =========================
    // DELETE
    // =========================
    @Transactional
    public void delete(Long id) {
        Event event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        if (event.getParticipants() != null) {
            for (User user : event.getParticipants()) {
                user.getJoinedEvents().remove(event);
            }
            event.getParticipants().clear();
        }

        imageService.deleteByFromId("EVENT", event.getId());
        themeRepository.deleteByEventId(event.getId());
        repository.deleteById(event.getId());
    }

    // =========================
    // HELPERS
    // =========================
    private UserDTO toUserDTO(User u) {
        ImageDTO image = imageRepository.findByFromTypeAndFromId("USER", u.getId())
                .stream()
                .findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

        ImageDTO banner = imageRepository.findByFromTypeAndFromId("USER_BANNER", u.getId())
                .stream()
                .findFirst()
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
                .stream()
                .findFirst()
                .map(img -> new ImageDTO(img.getId(), img.getUrl()))
                .orElse(null);

        UserDTO creator = e.getCreator() != null ? toUserDTO(e.getCreator()) : null;

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
                creator,
                image
        );
    }
}
