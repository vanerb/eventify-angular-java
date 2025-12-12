package com.ubication.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

     @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @Column(nullable = false, length = 500)
       private String comment;

       @ManyToOne
       @JoinColumn(name = "post_id")
       private Post post;

       @ManyToOne
       @JoinColumn(name = "event_id")
       private Event event;

       @ManyToOne
              @JoinColumn(name = "user_id")
              private User user;

       @Column(updatable = false)
       private LocalDateTime createdAt;

       @PrePersist
       public void prePersist() {
           createdAt = LocalDateTime.now();
       }
}
