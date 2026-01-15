package com.easychat.app.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Table(name = "encryptedMessages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 1000, columnDefinition = "TEXT")
    private String cipherText;

    @Column(nullable = false, length = 32)
    private String iv;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false)
    private String receiver;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate(){
        timestamp = LocalDateTime.now();
    }

}
