-- Eventify: base de datos de prueba con datos inventados.
-- Cuentas: laura@eventify.test, hugo@eventify.test, sara@eventify.test, ivan@eventify.test
-- Contraseña de todas: Usuario123*
-- Importar en MySQL o MariaDB. No borra nada: si las tablas ya existen, la importación se detiene con un error.

CREATE DATABASE IF NOT EXISTS `meetfriends_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `meetfriends_db`;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `chat_message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci,
  `event_id` bigint DEFAULT NULL,
  `sender` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `comment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `event_id` bigint DEFAULT NULL,
  `post_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhr48nopy5aorw0ta1ii704tpu` (`event_id`),
  KEY `FKs1slvnkuemjsq2kj4h3vhx7i1` (`post_id`),
  KEY `FK8kcum44fvpupyw6f5baccx25c` (`user_id`),
  CONSTRAINT `FK8kcum44fvpupyw6f5baccx25c` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKhr48nopy5aorw0ta1ii704tpu` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`),
  CONSTRAINT `FKs1slvnkuemjsq2kj4h3vhx7i1` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `end_date` datetime(6) DEFAULT NULL,
  `init_date` datetime(6) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `place_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubication` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKfnvc9jgli0tyfktl08q7h5rgd` (`creator_id`),
  CONSTRAINT `FKfnvc9jgli0tyfktl08q7h5rgd` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `event_user` (
  `user_id` bigint NOT NULL,
  `event_id` bigint NOT NULL,
  KEY `FKtc58o1e7bpugjcxuqr8l05l12` (`event_id`),
  KEY `FK67g39uhr99s8ney3d8tccqtf6` (`user_id`),
  CONSTRAINT `FK67g39uhr99s8ney3d8tccqtf6` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `FKtc58o1e7bpugjcxuqr8l05l12` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `hashtag` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `post_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK72o9i5lc593v21u4pulq8jwoi` (`post_id`),
  CONSTRAINT `FK72o9i5lc593v21u4pulq8jwoi` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `image` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `from_id` bigint DEFAULT NULL,
  `from_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_cover` bit(1) DEFAULT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `post` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator_id` bigint DEFAULT NULL,
  `event_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKko69comcms0m0mb60dprlj95r` (`creator_id`),
  KEY `FK3v4llf5c3wukq0k29f522erpe` (`event_id`),
  CONSTRAINT `FK3v4llf5c3wukq0k29f522erpe` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`),
  CONSTRAINT `FKko69comcms0m0mb60dprlj95r` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `theme` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4an6pkl1y4gxl86sra44g5shf` (`event_id`),
  CONSTRAINT `FK4an6pkl1y4gxl86sra44g5shf` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` longblob,
  `profile_image_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user` (`id`, `name`, `username`, `email`, `password`, `bio`) VALUES
  (1, 'Laura Campos', 'laura.campos', 'laura@eventify.test', '$2a$10$dYQeE7/N.xEjUk439Kh...0BOhgobPv3z.Epf.PnkxzVKxUP.Jb3G', 'Me gustan los conciertos pequeños.'),
  (2, 'Hugo Ferrer', 'hugo.ferrer', 'hugo@eventify.test', '$2a$10$dYQeE7/N.xEjUk439Kh...0BOhgobPv3z.Epf.PnkxzVKxUP.Jb3G', 'Senderismo los fines de semana.'),
  (3, 'Sara Medina', 'sara.medina', 'sara@eventify.test', '$2a$10$dYQeE7/N.xEjUk439Kh...0BOhgobPv3z.Epf.PnkxzVKxUP.Jb3G', 'Organizo talleres de programación.'),
  (4, 'Iván Rojas', 'ivan.rojas', 'ivan@eventify.test', '$2a$10$dYQeE7/N.xEjUk439Kh...0BOhgobPv3z.Epf.PnkxzVKxUP.Jb3G', 'Lector y aficionado a la fotografía.');
INSERT INTO `event` (`id`, `name`, `description`, `init_date`, `end_date`, `latitude`, `longitude`, `type`, `ubication`, `creator_id`) VALUES
  (1, 'Concierto acústico al aire libre', 'Tarde de música en directo con artistas locales.', '2027-05-14 18:30:00', '2027-05-14 21:00:00', 40.4153, -3.6845, 'notOnline', 'Parque de ejemplo, Madrid, España', 1),
  (2, 'Ruta de senderismo de primavera', 'Excursión de 12 km de dificultad media.', '2027-04-18 09:00:00', '2027-04-18 15:00:00', 41.7709, 2.4411, 'notOnline', 'Sendero de ejemplo, Barcelona, España', 2),
  (3, 'Taller de introducción a Angular', 'Sesión en línea para crear una primera aplicación.', '2027-03-10 18:00:00', '2027-03-10 20:00:00', NULL, NULL, 'online', NULL, 3),
  (4, 'Club de lectura en línea', 'Comentamos una novela cada mes.', '2027-06-02 19:00:00', '2027-06-02 20:30:00', NULL, NULL, 'online', NULL, 4);
INSERT INTO `event_user` (`user_id`, `event_id`) VALUES
  (2, 1),
  (3, 1),
  (1, 2),
  (4, 2),
  (1, 3),
  (2, 3),
  (3, 4),
  (1, 4);
INSERT INTO `theme` (`id`, `name`, `event_id`) VALUES
  (1, 'Music', 1),
  (2, 'Recreation', 1),
  (3, 'Sports', 2),
  (4, 'Technology', 3),
  (5, 'Education', 3),
  (6, 'Literature', 4);
INSERT INTO `post` (`id`, `description`, `creator_id`, `event_id`) VALUES
  (1, 'Ya tenemos preparado el escenario.', 1, 1),
  (2, 'Consejos para llevar a la ruta: agua y calzado cómodo.', 2, 2),
  (3, 'Material del taller disponible antes de empezar.', 3, 3);
INSERT INTO `hashtag` (`id`, `name`, `post_id`) VALUES
  (1, 'musica', 1),
  (2, 'senderismo', 2),
  (3, 'angular', 3);
INSERT INTO `comment` (`id`, `comment`, `created_at`, `event_id`, `post_id`, `user_id`) VALUES
  (1, '¡Qué ganas de ir!', '2026-10-05 12:00:00', 1, 1, 2),
  (2, '¿Hace falta experiencia previa?', '2026-10-06 09:30:00', 3, 3, 1),
  (3, 'Llevaré bastones.', '2026-10-07 20:15:00', 2, 2, 4);
INSERT INTO `chat_message` (`id`, `content`, `event_id`, `sender`, `timestamp`, `user_id`) VALUES
  (1, 'Hola a todos, ¿quién viene?', 1, 'laura.campos', '2026-10-08 18:00:00', 1),
  (2, 'Yo me apunto.', 1, 'hugo.ferrer', '2026-10-08 18:04:00', 2);
INSERT INTO `image` (`id`, `from_id`, `from_type`, `is_cover`, `url`) VALUES
  (1, 1, 'USER', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23c98b9b''/%3E%3C/svg%3E'),
  (2, 1, 'USER_BANNER', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23c98b9b''/%3E%3C/svg%3E'),
  (3, 2, 'USER', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%237fa99b''/%3E%3C/svg%3E'),
  (4, 2, 'USER_BANNER', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%237fa99b''/%3E%3C/svg%3E'),
  (5, 3, 'USER', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%238e9fcf''/%3E%3C/svg%3E'),
  (6, 3, 'USER_BANNER', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%238e9fcf''/%3E%3C/svg%3E'),
  (7, 4, 'USER', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23d6a76c''/%3E%3C/svg%3E'),
  (8, 4, 'USER_BANNER', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23d6a76c''/%3E%3C/svg%3E'),
  (9, 1, 'EVENT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23c98b9b''/%3E%3C/svg%3E'),
  (10, 2, 'EVENT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%237fa99b''/%3E%3C/svg%3E'),
  (11, 3, 'EVENT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%238e9fcf''/%3E%3C/svg%3E'),
  (12, 4, 'EVENT', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23d6a76c''/%3E%3C/svg%3E'),
  (13, 1, 'POST', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%23c98b9b''/%3E%3C/svg%3E'),
  (14, 2, 'POST', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%237fa99b''/%3E%3C/svg%3E'),
  (15, 3, 'POST', 1, 'data:image/svg+xml,%3Csvg xmlns=''http://www.w3.org/2000/svg'' viewBox=''0 0 4 3''%3E%3Crect width=''4'' height=''3'' fill=''%238e9fcf''/%3E%3C/svg%3E');

SET FOREIGN_KEY_CHECKS = 1;
