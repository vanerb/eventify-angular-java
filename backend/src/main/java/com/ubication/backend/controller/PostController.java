
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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
    public Page<PostDTO> findByUserId(@RequestHeader("Authorization") String authHeader,@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return service.findByUserId(authHeader, page, size);
    }

     @GetMapping("/findById/{id}")
        public PostDTO findById(@PathVariable Long id) {
            return service.findById(id);
        }

    @GetMapping("/getAll")
    public Page<PostDTO> findAll(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return service.findAll(page, size);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
