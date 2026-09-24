package com.ubication.backend.repository;

import com.ubication.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {
     Page<Event> findByCreatorId(Long creatorId, Pageable pageable);

     @Query("SELECT e FROM Event e JOIN e.participants u WHERE u.id = :userId")
     Page<Event> findAllByParticipantsId(Long userId, Pageable pageable);

     Page<Event> findByParticipantsIdAndNameContainingIgnoreCase(
                 Long participantId,
                 String name,
                 Pageable pageable
         );

     Page<Event> findDistinctByThemesNameIn(List<String> themeNames, Pageable pageable);
}
