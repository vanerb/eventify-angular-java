package com.ubication.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;       // URL o path de la imagen
    private String fromType;  // "USER", "EVENT", etc.
    private Long fromId;      // id del usuario o evento

    private Boolean isCover = false; // opcional: si es imagen de portada
}
