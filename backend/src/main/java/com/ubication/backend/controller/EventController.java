
package com.ubication.backend.controller;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.dto.UserDTO;
import com.ubication.backend.service.EventService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;



@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200")
public class EventController {

    @Autowired
    private EventService service;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EventDTO create(
            @RequestPart("event") EventDTO eventDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        return service.create(eventDTO, file);
    }

    @PostMapping(value = "/update/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public EventDTO update(
                @PathVariable Long eventId,
                @RequestPart("event") EventDTO eventDTO,
                @RequestPart(value = "file", required = false) MultipartFile file) {

            return service.update(eventId, eventDTO, file);
        }


         @DeleteMapping("/delete/{id}")
            public void delete(@PathVariable Long id) {
                service.delete(id);
            }

              @PostMapping("/{eventId}/join/{userId}")
                public EventDTO joinEvent(@PathVariable Long eventId, @PathVariable Long userId) {
                    return service.joinEvent(eventId, userId);
                }






    @GetMapping("/findByUserId")
    public Page<EventDTO> findByUserId(@RequestHeader("Authorization") String authHeader,@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return service.findByUserId(authHeader, page, size);
    }

    @GetMapping("/findMyEventParticipations")
        public Page<EventDTO> findMyEventParticipations(@RequestHeader("Authorization") String authHeader,@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,  @RequestParam(required = false) String search) {
            return service.findMyEventParticipations(authHeader, page, size, search);
        }

    @GetMapping("/getAll")
    public Page<EventDTO> findAll(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return service.findAll(page, size);
    }


    @GetMapping("/{eventId}/users")
    public Page<UserDTO> getUsers( @PathVariable Long eventId,@RequestParam(defaultValue = "0") int page,@RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
           return service.getUsersByEvent(eventId, pageable);
    }
}
