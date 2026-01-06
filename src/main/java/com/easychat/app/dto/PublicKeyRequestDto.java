package com.easychat.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import tools.jackson.databind.JsonNode;

@Data
public class PublicKeyRequestDto {

    @NotNull
    private JsonNode publicKey;

}
