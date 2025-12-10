package com.ubication.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @ManyToOne
        @JoinColumn(name = "creator_id")
        @JsonIgnoreProperties({"createdEvents", "joinedEvents"})
        private User creator;



    @ManyToOne
       @JoinColumn(name = "event_id", nullable = true) // relación opcional
       @JsonIgnoreProperties({"posts"}) // si necesitas evitar recursión
       private Event event;
}
