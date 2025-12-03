package com.ubication.backend.controller;

import com.ubication.backend.model.Image;
import com.ubication.backend.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageController {

    @Autowired
    private ImageService service;

    @PostMapping("/upload")
    public Image uploadImage(@RequestParam("file") MultipartFile file,
                             @RequestParam String fromType,
                             @RequestParam Long fromId,
                             @RequestParam(defaultValue = "false") boolean isCover) throws IOException {

        return service.upload(file, fromType, fromId, isCover);
    }


    @GetMapping("/{fromType}/{fromId}")
    public List<Image> getImages(@PathVariable String fromType, @PathVariable Long fromId) {
        return service.getImages(fromType, fromId);
    }
}
