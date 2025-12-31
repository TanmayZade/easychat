package com.easychat.app.dto;

import lombok.Data;

@Data
public class RegisterResponse {
    private String message;

    public String getMessage() {
        return message;
    }

    public RegisterResponse(String message){
        this.message = message;
    }
}
