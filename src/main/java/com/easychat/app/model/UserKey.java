package com.easychat.app.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_keys")
public class UserKey {

    @Id
    private String username;

    @Column(nullable = false,length = 4096, updatable = false)
    private String publicKeyJwk;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreatedAt(){
        createdAt = LocalDateTime.now();
    }
}
