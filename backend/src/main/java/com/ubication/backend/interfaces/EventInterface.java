
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

    List<EventDTO> findByUserId(String authHeader);

    List<EventDTO> findAll();

    void delete(Long id);

    Event joinEvent(Long eventId, Long userId);

    List<UserDTO> getUsersByEvent(Long eventId);


}
