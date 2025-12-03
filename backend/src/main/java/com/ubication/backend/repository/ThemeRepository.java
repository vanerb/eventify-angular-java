package com.ubication.backend.repository;

import com.ubication.backend.model.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, Long> {
    // Si quieres, puedes agregar consultas personalizadas aquí
    // Ejemplo: buscar por nombre
    // Optional<Theme> findByName(String name);
}
