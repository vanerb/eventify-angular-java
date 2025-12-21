
package com.ubication.backend.controller;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Post;
import com.ubication.backend.dto.PostDTO;
import com.ubication.backend.service.PostService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    @Autowired
    private PostService service;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostDTO create(
            @RequestPart("post") PostDTO postDTO,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        return service.create(postDTO, file);
    }

    @GetMapping("/findByUserId")
    public List<PostDTO> findByUserId(@RequestHeader("Authorization") String authHeader) {
        return service.findByUserId(authHeader);
    }

     @GetMapping("/findById/{id}")
        public PostDTO findById(@PathVariable Long id) {
            return service.findById(id);
        }

    @GetMapping("/getAll")
    public List<PostDTO> findAll() {
        return service.findAll();
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
