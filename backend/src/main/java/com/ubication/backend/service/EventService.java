package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.ImageDTO;
import com.ubication.backend.model.Theme;
import com.ubication.backend.model.Image;
import com.ubication.backend.repository.UserRepository;
import com.ubication.backend.repository.EventRepository;
import com.ubication.backend.repository.ThemeRepository;
import com.ubication.backend.repository.ImageRepository;

import com.ubication.backend.service.ImageService;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.dto.ThemeDTO;
import org.springframework.stereotype.Service;

import com.ubication.backend.interfaces.EventInterface;
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

    @Override
    public Event create(EventDTO dto, MultipartFile file) {
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
                throw new RuntimeException("Error al guardar la imagen en Image table", e);
            }
        }

        return savedEvent;
    }

    @Transactional
    @Override
    public Event update(Long eventId, EventDTO dto, MultipartFile file) {
           String token = request.getHeader("Authorization").replace("Bearer ", "");
           String email = jwtUtil.extractEmail(token);

           User user = userRepository.findByEmail(email)
                   .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

           Event event = repository.findById(eventId)
                   .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

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

           if(file != null && !file.isEmpty()){
            imageService.deleteByFromId("EVENT", savedEvent.getId());


           }

            if (file != null && !file.isEmpty()) {
                                     try {
                                         imageService.upload(file, "EVENT", savedEvent.getId(), true);
                                     } catch (IOException e) {
                                         throw new RuntimeException("Error al guardar la imagen", e);
                                     }
                                 }



           return savedEvent;
    }

    @Override
    public Event joinEvent(Long eventId, Long userId) {
        Event event = repository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!event.getParticipants().contains(user)) {
            event.getParticipants().add(user);
            user.getJoinedEvents().add(event);
            userRepository.save(user);
        }

        return event;
    }

    @Override
    public List<User> getUsersByEvent(Long eventId) {
        Event event = repository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        return event.getParticipants();
    }

    public List<Event> findByUserId(Long userId) {
        return repository.findByCreatorId(userId);
    }

    public List<EventDTO> findMyEventParticipations(String header) {
        String token = header.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!token.equals(user.getToken())) {
            throw new RuntimeException("Invalid token");
        }

        return repository.findAllByParticipantsId(user.getId())
                .stream()
                .map(e -> {
                    List<ThemeDTO> themes = e.getThemes() != null
                            ? e.getThemes().stream()
                                    .map(t -> new ThemeDTO(t.getId(), t.getName()))
                                    .collect(Collectors.toList())
                            : Collections.emptyList();

                    List<Image> images = imageRepository.findByFromTypeAndFromId("EVENT", e.getId());
                    ImageDTO imageDTO = images.isEmpty()
                            ? null
                            : new ImageDTO(
                                    images.get(0).getId(),
                                    images.get(0).getUrl());

                    return new EventDTO(
                            e.getId(), // Long id
                            e.getInitDate(), // LocalDateTime initDate
                            e.getEndDate(), // LocalDateTime endDate
                            e.getPlaceId(), // String placeId
                            themes, // List<ThemeDTO> themes
                            e.getParticipants(), // List<User> participants
                            e.getUbication(), // String ubication

                            e.getLatitude(), // Double latitude
                            e.getLongitude(), // Double longitude
                            e.getName(), // String name
                            e.getDescription(), // String description
                            e.getType(),
                            e.getCreator(), // User creator
                            imageDTO);
                })
                .collect(Collectors.toList());
    }

    public List<EventDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(e -> {
                    List<ThemeDTO> themes = e.getThemes() != null
                            ? e.getThemes().stream()
                                    .map(t -> new ThemeDTO(t.getId(), t.getName()))
                                    .collect(Collectors.toList())
                            : Collections.emptyList();

                    List<Image> images = imageRepository.findByFromTypeAndFromId("EVENT", e.getId());
                    ImageDTO imageDTO = images.isEmpty()
                            ? null
                            : new ImageDTO(
                                    images.get(0).getId(),
                                    images.get(0).getUrl());

                    return new EventDTO(
                            e.getId(), // Long id
                            e.getInitDate(), // LocalDateTime initDate
                            e.getEndDate(), // LocalDateTime endDate
                            e.getPlaceId(), // String placeId
                            themes, // List<ThemeDTO> themes
                            e.getParticipants(), // List<User> participants
                            e.getUbication(), // String ubication

                            e.getLatitude(), // Double latitude
                            e.getLongitude(), // Double longitude
                            e.getName(), // String name
                            e.getDescription(), // String description
                            e.getType(),
                            e.getCreator(), // User creator
                            imageDTO);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        Event event = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

         if (event.getParticipants() != null) {
                for (User user : event.getParticipants()) {
                    user.getJoinedEvents().remove(event);  // quitar el evento de cada usuario
                }
                event.getParticipants().clear();  // limpiar lista en memoria
            }

        imageService.deleteByFromId("EVENT", event.getId());

        themeRepository.deleteByEventId(event.getId());

        repository.deleteById(event.getId());
    }
}
