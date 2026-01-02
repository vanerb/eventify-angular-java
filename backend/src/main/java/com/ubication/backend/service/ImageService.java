package com.ubication.backend.service;

import com.ubication.backend.model.Image;
import com.ubication.backend.repository.ImageRepository;
import com.ubication.backend.interfaces.ImageInterface;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;

@Service
public class ImageService implements ImageInterface {

    @Autowired
    private ImageRepository repository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // Carpeta base absoluta o relativa al proyecto
    private final String UPLOAD_DIR = new File("uploads").getAbsolutePath() + File.separator;

    @Override
    public Image upload(MultipartFile file, String fromType, Long fromId, boolean isCover) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No se recibió ningún archivo");
        }

        // 1️⃣ Crear carpeta destino: uploads/{fromType}/{fromId}/
        String folder = UPLOAD_DIR + fromType.toLowerCase() + File.separator + fromId + File.separator;
        File dir = new File(folder);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new RuntimeException("No se pudo crear la carpeta para guardar la imagen: " + folder);
        }

        // 2️⃣ Guardar archivo físico
        String safeFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename(); // evita colisiones
        File dest = new File(folder + safeFileName);
        file.transferTo(dest);

        // 3️⃣ Guardar referencia en base de datos
        Image img = new Image();
        img.setUrl("/uploads/" + fromType.toLowerCase() + "/" + fromId + "/" + safeFileName);
        img.setFromType(fromType);
        img.setFromId(fromId);
        img.setIsCover(isCover);

        return repository.save(img);
    }

    @Override
    public Image getCoverImage(String fromType, Long fromId) {
        return repository
                .findByFromTypeAndFromIdAndIsCoverTrue(fromType, fromId)
                .orElse(null);
    }

    @Override
    public List<Image> getImages(String fromType, Long fromId) {
        return repository.findByFromTypeAndFromId(fromType, fromId);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }


    public void deleteByFromId(String fromType, Long fromId) {
        List<Image> images = repository.findByFromTypeAndFromId(fromType, fromId);
        for (Image img : images) {
            deleteFile(img);
            repository.delete(img);
        }

    }

   private void deleteFile(Image img) {
       try {
           String relativePath = img.getUrl().replaceFirst("^/uploads/?", "");

           Path filePath = Paths.get(uploadDir)
                   .resolve(relativePath)
                   .normalize();

           Files.deleteIfExists(filePath);

           System.out.println("Archivo borrado: " + filePath.toAbsolutePath());

       } catch (IOException e) {
           throw new RuntimeException(
                   "No se pudo borrar el archivo: " + img.getUrl(), e
           );
       }
   }
}
