
package com.ubication.backend.controller;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.service.EventService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;



@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200")
public class EventController {

    @Autowired
    private EventService service;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Event create(
            @RequestPart("event") EventDTO eventDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        return service.create(eventDTO, file);
    }

    @PostMapping(value = "/update/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public Event update(
                @PathVariable Long eventId,
                @RequestPart("event") EventDTO eventDTO,
                @RequestPart(value = "file", required = false) MultipartFile file) {

            return service.update(eventId, eventDTO, file);
        }

    @GetMapping("/findByUserId/{userId}")
    public List<Event> findByUserId(@PathVariable Long userId) {
        return service.findByUserId(userId);
    }

    @GetMapping("/findMyEventParticipations")
        public List<EventDTO> findMyEventParticipations(@RequestHeader("Authorization") String authHeader) {
            return service.findMyEventParticipations(authHeader);
        }

    @GetMapping("/getAll")
    public List<EventDTO> findAll() {
        return service.findAll();
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }


    @PostMapping("/{eventId}/join/{userId}")
    public Event joinEvent(@PathVariable Long eventId, @PathVariable Long userId) {
        return service.joinEvent(eventId, userId);
    }

    @GetMapping("/{eventId}/users")
    public List<User> getUsers(@PathVariable Long eventId) {
        return service.getUsersByEvent(eventId);
    }
}
