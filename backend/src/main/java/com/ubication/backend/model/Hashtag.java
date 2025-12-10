package com.ubication.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

   @ManyToOne
   @JoinColumn(name = "post_id")
   @JsonIgnore
   private Post post;
}
