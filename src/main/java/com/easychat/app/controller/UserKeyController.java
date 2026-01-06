package com.easychat.app.controller;

import com.easychat.app.dto.PublicKeyRequestDto;
import com.easychat.app.dto.PublicKeyResponseDto;
import com.easychat.app.service.UserKeyService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/keys")
public class UserKeyController {

    private final UserKeyService userKeyService;

    @PostMapping("/upload")
    public ResponseEntity<Void> uploadPublicKey(
            @Valid @RequestBody PublicKeyRequestDto request,
            Authentication auth
    ) {
        String username = auth.getName();
        String jwkJSON = request.getPublicKey().toString();

        userKeyService.savePublicKey(username, jwkJSON);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Object>> getPublicKey(
            @PathVariable String username
    ) {
        String jwkJson = userKeyService.getPublicKeyJson(username);

        // Let Spring/Jackson convert JSON → Map automatically
        Map<String, Object> jwk =
                new org.springframework.boot.json.JacksonJsonParser()
                        .parseMap(jwkJson);

        return ResponseEntity.ok(
                Map.of("publicKey", jwk)
        );
    }
}
