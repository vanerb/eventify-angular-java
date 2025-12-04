package com.ubication.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Lob
    private String description;

    private String type;


    @Column(name = "init_date")
    private LocalDateTime initDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    private String placeId;

    private String ubication;

    private Double latitude;

    private Double longitude;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    @JsonIgnoreProperties({"createdEvents", "joinedEvents"})
    private User creator;

    @ManyToMany(mappedBy = "joinedEvents")
    @JsonIgnore
    private List<User> participants;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Theme> themes;

}
