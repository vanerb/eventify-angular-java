package com.ubication.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // ⚠ Desactiva CSRF para APIs REST
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/**").permitAll() // Permite TODO
            )
            .httpBasic(httpBasic -> {})       // desactiva autenticación
            .formLogin(form -> form.disable()); // desactiva login web

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
