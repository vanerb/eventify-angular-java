# 🎉 Eventify — Angular + Java

**Eventify** es una aplicación web para la creación y gestión de eventos, desarrollada con **Angular** en el frontend y **Java Spring Boot** en el backend.

La aplicación permite a los usuarios crear eventos, participar en ellos, interactuar con otros asistentes y compartir contenido relacionado con cada evento.

---

## 🚀 Tecnologías utilizadas

### Frontend

* **Angular**
* **TypeScript**
* **HTML5**
* **CSS**
* **Tailwind CSS**
* **Angular Material**
* **RxJS**

### Backend

* **Java**
* **Spring Boot**
* **Spring Data JPA**
* **Hibernate**
* **REST API**
* **Maven**
* **MySQL**

### Herramientas

* **Git**
* **GitHub**
* **Postman**
* **npm**
* **Composer**

---

## ✨ Funcionalidades

### 📅 Gestión de eventos

Los usuarios pueden crear y gestionar sus propios eventos.

Cada evento puede incluir información como:

* Nombre
* Descripción
* Fecha
* Hora
* Ubicación
* Imagen
* Tipo de evento

Los eventos pueden ser:

* 🌐 **Online**
* 📍 **Presenciales**

---

### 👥 Participación en eventos

Los usuarios pueden consultar los eventos disponibles y unirse a aquellos en los que estén interesados.

La aplicación permite gestionar la participación de los usuarios en cada evento.

---

### 💬 Chats de eventos

Cada evento dispone de un sistema de chat para que los participantes puedan comunicarse entre ellos.

El sistema utiliza comunicación en tiempo real mediante:

* **WebSocket**
* **STOMP**
* **SockJS**

Esto permite enviar y recibir mensajes sin necesidad de recargar la página.

---

### 📝 Publicaciones

Los usuarios pueden compartir publicaciones relacionadas con los eventos.

Las publicaciones pueden incluir:

* Texto
* Imágenes
* Comentarios

De esta forma, los participantes pueden compartir contenido y experiencias relacionadas con los eventos.

---

### 🖼️ Gestión de imágenes

La aplicación permite utilizar imágenes para diferentes elementos:

* Eventos
* Publicaciones
* Usuarios
* Portadas de usuario

Las imágenes se almacenan y gestionan desde el backend.

---

### 🔐 Autenticación

El proyecto incorpora un sistema de autenticación para gestionar los usuarios y proteger los recursos de la aplicación.

La comunicación entre frontend y backend se realiza mediante una **API REST**.

---

## 📂 Estructura del proyecto

```text
Eventify-angular-java/
│
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── ...
│
└── README.md
```

---

## 🛠️ Requisitos previos

Antes de ejecutar el proyecto es necesario tener instalado:

* **Node.js**
* **npm**
* **Angular CLI**
* **Java 21**
* **Maven**
* **MySQL**
* **Git**

---

## 📥 Clonar el repositorio

```bash
git clone https://github.com/vanerb/Eventify-angular-java.git
cd Eventify-angular-java
```

---

# 🖥️ Instalación y ejecución

## 1️⃣ Backend — Spring Boot

Accede al directorio del backend:

```bash
cd backend
```

Configura la conexión con la base de datos en:

```text
src/main/resources/application.properties
```

Configura los datos correspondientes a tu entorno, por ejemplo:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/TU_BASE_DE_DATOS
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_CONTRASEÑA
```

A continuación, compila el proyecto:

```bash
mvn clean install
```

Y ejecuta Spring Boot:

```bash
mvn spring-boot:run
```

El backend estará disponible por defecto en:

```text
http://localhost:8080
```

---

## 2️⃣ Frontend — Angular

Abre otra terminal y accede al frontend:

```bash
cd frontend
```

Instala las dependencias:

```bash
npm install
```

Ejecuta la aplicación:

```bash
ng serve
```

El frontend estará disponible normalmente en:

```text
http://localhost:4200
```

---

## 🔄 Arquitectura

Eventify utiliza una arquitectura dividida en frontend y backend:

```text
                  ┌─────────────────────┐
                  │       Usuario       │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │      Angular       │
                  │     Frontend       │
                  └──────────┬──────────┘
                             │
                      HTTP / REST API
                             │
                             ▼
                  ┌─────────────────────┐
                  │    Spring Boot     │
                  │      Backend       │
                  └──────────┬──────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
             ┌─────────────┐   ┌─────────────┐
             │    MySQL    │   │ WebSocket   │
             │  Database   │   │    Chat     │
             └─────────────┘   └─────────────┘
```

---

## 📡 Comunicación en tiempo real

Para el sistema de chat se utiliza WebSocket junto con STOMP y SockJS.

Los mensajes se envían a través de canales asociados a cada evento, permitiendo que los participantes reciban los mensajes en tiempo real.

---

## 🗄️ Base de datos

La aplicación utiliza **MySQL** como sistema de gestión de base de datos.

Entre las entidades principales del proyecto se encuentran:

* Usuarios
* Eventos
* Participantes
* Publicaciones
* Comentarios
* Mensajes
* Imágenes

La relación entre estas entidades permite gestionar los diferentes elementos de la aplicación y las interacciones entre los usuarios.

---

## 🔌 API REST

El backend proporciona diferentes endpoints REST para que el frontend pueda realizar operaciones sobre los datos.

Entre las operaciones principales se encuentran:

* Gestión de usuarios
* Gestión de eventos
* Gestión de participantes
* Gestión de publicaciones
* Gestión de comentarios
* Gestión de imágenes
* Gestión de mensajes

---

## 🎯 Objetivo del proyecto

El objetivo de Eventify es desarrollar una plataforma web que permita a los usuarios **crear, descubrir y participar en eventos**, proporcionando además herramientas de comunicación e interacción entre sus participantes.

El proyecto permite poner en práctica diferentes conceptos de desarrollo web full stack:

* Desarrollo de aplicaciones SPA con Angular.
* Creación de APIs REST con Spring Boot.
* Persistencia de datos mediante JPA/Hibernate.
* Gestión de bases de datos MySQL.
* Autenticación y autorización.
* Comunicación en tiempo real mediante WebSocket.
* Gestión de imágenes.
* Arquitectura cliente-servidor.
* Desarrollo de interfaces con Angular Material y Tailwind CSS.

---

## 📌 Estado del proyecto

**En desarrollo.**

El proyecto puede seguir ampliándose con nuevas funcionalidades, mejoras de interfaz y nuevas herramientas de interacción entre los usuarios.

---

## 👩‍💻 Autora

**Vanesa Ribera Bautista**

Proyecto desarrollado utilizando **Angular + Java Spring Boot + MySQL**.
