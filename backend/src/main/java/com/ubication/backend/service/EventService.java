package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.model.Theme;
import com.ubication.backend.repository.UserRepository;
import com.ubication.backend.repository.EventRepository;
import com.ubication.backend.repository.ThemeRepository;

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


@Service
public class EventService implements EventInterface {

    @Autowired
    private EventRepository repository;

    @Autowired
    private UserRepository userRepository;

     @Autowired
        private ThemeRepository themeRepository;

     @Autowired
        private JwtUtil jwtUtil;

          @Autowired
            private HttpServletRequest request;

            @Autowired
            private ImageService imageService;

   @Override
   public Event create(EventDTO dto, MultipartFile file) {
       // 1️⃣ Obtener usuario desde JWT
       String token = request.getHeader("Authorization").replace("Bearer ", "");
       String email = jwtUtil.extractEmail(token);

       User user = userRepository.findByEmail(email)
               .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

       // 2️⃣ Crear evento
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

               savedEvent.setHeaderImageName(file.getOriginalFilename());
               repository.save(savedEvent);
           } catch (IOException e) {
               throw new RuntimeException("Error al guardar la imagen en Image table", e);
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

        event.getParticipants().add(user);
        user.getJoinedEvents().add(event);

        userRepository.save(user);
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

  public List<EventDTO> findAll() {
      return repository.findAll()
          .stream()
          .map(e -> {
              List<ThemeDTO> themes = e.getThemes() != null
                  ? e.getThemes().stream()
                      .map(t -> new ThemeDTO(t.getId(), t.getName()))
                      .collect(Collectors.toList())
                  : Collections.emptyList();

              return new EventDTO(
                     e.getId(),                // Long id
                                  e.getInitDate(),          // LocalDateTime initDate
                                  e.getEndDate(),           // LocalDateTime endDate
                                  e.getPlaceId(),           // String placeId
                                  themes,                   // List<ThemeDTO> themes
                                  e.getParticipants(),      // List<User> participants
                                  e.getUbication(),         // String ubication
                                  e.getHeaderImageName(),   // String headerImageName
                                  e.getLatitude(),          // Double latitude
                                  e.getLongitude(),         // Double longitude
                                  e.getName(),              // String name
                                  e.getDescription(),       // String description
                                  e.getType(),
                                  e.getCreator()            // User creator
              );
          })
          .collect(Collectors.toList());
  }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
