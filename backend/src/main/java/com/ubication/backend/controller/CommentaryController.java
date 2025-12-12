
package com.ubication.backend.controller;

import com.ubication.backend.dto.CommentDTO;
import com.ubication.backend.model.Comment;

import com.ubication.backend.service.CommentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;



@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentaryController {

    @Autowired
    private CommentService service;

    @PostMapping(value = "/create")
    public Comment create(
            @RequestPart("comment") CommentDTO commentDTO) {

        return service.create(commentDTO);
    }



 @DeleteMapping("/delete/{id}")
        public void delete(@PathVariable Long id) {
            service.delete(id);
        }

}
