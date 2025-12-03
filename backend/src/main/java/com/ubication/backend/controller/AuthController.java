package com.ubication.backend.controller;

import com.ubication.backend.model.User;
import com.ubication.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

   // Registro con imagen de perfil
       @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
       public User register(
               @RequestParam("email") String email,
               @RequestParam("password") String password,
               @RequestPart(value = "file", required = false) MultipartFile file) {
           return authService.register(email, password, file);
       }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        String token = authService.login(body.get("email"), body.get("password"));
        return Map.of("token", token);
    }


   @GetMapping("/user")
   public User getUserFromToken(@RequestHeader("Authorization") String authHeader) {
        return authService.findUserByToken(authHeader);
   }
}
