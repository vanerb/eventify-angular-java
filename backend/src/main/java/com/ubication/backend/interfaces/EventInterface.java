
package com.ubication.backend.interfaces;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.dto.UserDTO;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventInterface {
    EventDTO create(EventDTO dto, MultipartFile file);

    EventDTO update(Long eventId, EventDTO dto, MultipartFile file);

    Page<EventDTO> findByUserId(String authHeader, int page, int size);

    Page<EventDTO> findAll(int page, int size);

    void delete(Long id);

    EventDTO joinEvent(Long eventId, Long userId);

    Page<UserDTO> getUsersByEvent(Long eventId, Pageable pageable);


}
