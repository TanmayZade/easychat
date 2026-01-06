package com.easychat.app.exception;

import jakarta.persistence.ElementCollection;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthException(AuthenticationException e){
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e){
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(PublicKeyAlreadyExistException.class)
    public ResponseEntity<?> handleAlreadyExists(PublicKeyAlreadyExistException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error","PUBLIC_KEY_ALREADY_EXISTS"
                        ,"message",ex.getMessage()
                ));

    }

    @ExceptionHandler(PublicKeyNotFoundException.class)
    public ResponseEntity<?> handleKeyNotFoundException(PublicKeyNotFoundException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error","PUBLIC_KEY_NOT_FOUND"
                        ,"message",ex.getMessage()
                ));
    }
}
