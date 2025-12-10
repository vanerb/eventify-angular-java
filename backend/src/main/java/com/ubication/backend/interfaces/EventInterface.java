
package com.ubication.backend.interfaces;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.dto.UserDTO;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface EventInterface {
    Event create(EventDTO dto, MultipartFile file);

    Event update(Long eventId, EventDTO dto, MultipartFile file);

    List<Event> findByUserId(Long userId);

    List<EventDTO> findAll();

    void delete(Long id);

    Event joinEvent(Long eventId, Long userId);

    List<UserDTO> getUsersByEvent(Long eventId);


}




//package com.ubication.backend.service;
//
//import com.ubication.backend.model.User;
//import com.ubication.backend.model.Event;
//
//@Service
//public class EventService {
//
//    @Autowired
//    private EventRepository repo;
//
//    @Autowired
//    private UserRepository userRepo;
//
//    public Event create(Long userId, Event event) {
//        User user = userRepo.findById(userId)
//                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
//        event.setEvent(user);
//        return repo.save(event);
//    }
//
//    public List<Event> findByUserId(Long userId) {
//        return repo.findByUserId(userId);
//    }
//
//    public List<Event> findAll() {
//        return repo.findAll();
//    }
//
//    public void delete(Long id) {
//        repo.deleteById(id);
//    }
//}
