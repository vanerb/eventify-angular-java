package com.ubication.backend.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class LocationController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/location")
    public ResponseEntity<String> getLocation(
            @RequestParam double lat,
            @RequestParam double lng) {

        String url = "https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "MiAppSpring/1.0 (contact@example.test)");
        headers.set("Accept-Language", "es");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class,
                lat,
                lng
        );

        return ResponseEntity.ok(response.getBody());
    }

     @GetMapping("/location/search")
     public ResponseEntity<String> getSearchLocation(@RequestParam String query) {
         // Verifica si query está vacío o no
         if (query == null || query.isEmpty()) {
             return ResponseEntity.badRequest().body("Query parameter is required");
         }

         String url = "https://nominatim.openstreetmap.org/search?format=json&q=" + query;

         HttpHeaders headers = new HttpHeaders();
         headers.set("User-Agent", "MiAppSpring/1.0 (contact@example.test)");
         headers.set("Accept-Language", "es");

         HttpEntity<String> entity = new HttpEntity<>(headers);

         try {
             ResponseEntity<String> response = restTemplate.exchange(
                     url,
                     HttpMethod.GET,
                     entity,
                     String.class
             );
             return ResponseEntity.ok(response.getBody());
         } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during request to OpenStreetMap API");
         }
     }
}
