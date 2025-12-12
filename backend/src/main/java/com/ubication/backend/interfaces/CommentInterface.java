
package com.ubication.backend.interfaces;

import com.ubication.backend.model.Comment;
import com.ubication.backend.dto.CommentDTO;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface CommentInterface {
    Comment create(CommentDTO dto);
    void delete(Long id);

}