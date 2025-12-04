package com.ubication.backend.repository;

import com.ubication.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCreatorId(Long userId);

     @Query("SELECT e FROM Event e JOIN e.participants u WHERE u.id = :userId")
     List<Event> findAllByParticipantsId(Long userId);
}