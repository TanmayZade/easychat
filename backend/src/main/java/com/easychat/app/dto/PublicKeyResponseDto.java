package com.easychat.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import com.fasterxml.jackson.databind.JsonNode;

@Data
@AllArgsConstructor
public class PublicKeyResponseDto {
    private String message;
    private JsonNode publicKey;
}
