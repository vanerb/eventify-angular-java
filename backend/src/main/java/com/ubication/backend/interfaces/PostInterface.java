
package com.ubication.backend.interfaces;

import com.ubication.backend.model.User;
import com.ubication.backend.model.Post;
import com.ubication.backend.dto.PostDTO;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface PostInterface {
    PostDTO create(PostDTO dto, MultipartFile file);

    List<PostDTO> findByUserId(String userId);

    PostDTO findById(Long id);

    List<PostDTO> findAll();

    void delete(Long id);

}
