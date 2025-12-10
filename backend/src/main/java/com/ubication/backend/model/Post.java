package com.ubication.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
     private String url;

    @ManyToOne
        @JoinColumn(name = "creator_id")
        @JsonIgnoreProperties({"createdEvents", "joinedEvents"})
        private User creator;


   @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<Hashtag> hashtags = new ArrayList<>(); // lista inicializada

    @ManyToOne
       @JoinColumn(name = "event_id", nullable = true) // relación opcional
       @JsonIgnoreProperties({"posts"}) // si necesitas evitar recursión
       private Event event;
}
