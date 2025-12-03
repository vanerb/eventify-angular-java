package com.ubication.backend.repository;

import com.ubication.backend.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {

    // Traer todas las imágenes de un tipo y id
    List<Image> findByFromTypeAndFromId(String fromType, Long fromId);

    // Traer solo la imagen de portada
    Optional<Image> findByFromTypeAndFromIdAndIsCoverTrue(String fromType, Long fromId);
}
