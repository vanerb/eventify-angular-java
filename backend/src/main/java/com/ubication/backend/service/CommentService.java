package com.ubication.backend.service;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Event;
import com.ubication.backend.dto.ImageDTO;
import com.ubication.backend.dto.PostDTO;
import com.ubication.backend.dto.UserDTO;
import com.ubication.backend.dto.CommentDTO;
import com.ubication.backend.model.Theme;
import com.ubication.backend.model.Post;
import com.ubication.backend.model.Image;
import com.ubication.backend.model.Comment;
import com.ubication.backend.repository.UserRepository;
import com.ubication.backend.repository.EventRepository;
import com.ubication.backend.repository.ThemeRepository;
import com.ubication.backend.repository.ImageRepository;
import com.ubication.backend.repository.CommentRepository;
import com.ubication.backend.repository.PostRepository;

import com.ubication.backend.service.ImageService;
import com.ubication.backend.dto.EventDTO;
import com.ubication.backend.dto.ThemeDTO;
import org.springframework.stereotype.Service;

import com.ubication.backend.interfaces.CommentInterface;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.io.IOException;
import com.ubication.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Collections;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService implements CommentInterface {

    @Autowired
    private CommentRepository repository;

    @Autowired
    private UserRepository userRepository;

     @Autowired
        private EventRepository eventRepository;

         @Autowired
                private PostRepository postRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private HttpServletRequest request;



    @Override
    public Comment create(CommentDTO dto) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Comment comment = new Comment();
        comment.setComment(dto.comment());


        comment.setUser(user);


        if (dto.post() != null) {
                           Long postId = dto.post().id();
                           Post post = postRepository.findById(postId)
                                   .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
                           comment.setPost(post);
                       }

         if (dto.event() != null) {
                   Long eventId = dto.event().id();
                   Event event = eventRepository.findById(eventId)
                           .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
                   comment.setEvent(event);
               }

        Comment savedComment = repository.save(comment);


        return savedComment;
    }

    @Transactional
       public void delete(Long id) {
           Comment comment = repository.findById(id)
                   .orElseThrow(() -> new RuntimeException("Comentario no encontrado"));

           repository.deleteById(comment.getId());
       }

}
