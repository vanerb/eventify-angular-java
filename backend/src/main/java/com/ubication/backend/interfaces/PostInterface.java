
package com.ubication.backend.interfaces;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Post;
import com.ubication.backend.dto.PostDTO;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostInterface {
    PostDTO create(PostDTO dto, MultipartFile file);

    Page<PostDTO> findByUserId(String authHeader, int page, int size);

    PostDTO findById(Long id);

    Page<PostDTO> findAll(int page, int size);

    void delete(Long id);

}
