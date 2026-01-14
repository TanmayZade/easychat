package com.easychat.app.controller;

import com.easychat.app.dto.LoginRequest;
import com.easychat.app.dto.LoginResponse;
import com.easychat.app.dto.RegisterRequest;
import com.easychat.app.dto.RegisterResponse;
import com.easychat.app.model.EmailVerificationToken;
import com.easychat.app.model.User;
import com.easychat.app.repository.EmailVerificationTokenRepository;
import com.easychat.app.repository.UserRepository;
import com.easychat.app.security.JwtUtil;
import com.easychat.app.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final UserRepository userRepository;
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        System.out.println(">>> PROTECTED CONTROLLER HIT <<<");
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest registerRequest){
        System.out.println("Register API called successfully!");
        userService.registerUser(registerRequest);

        return ResponseEntity.ok(new RegisterResponse("Registration successful. Please verify your email."));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest){
        User user = userService.authenticate(loginRequest.getUsernameOrEmail(), loginRequest.getPassword());
        String token = JwtUtil.generateToken(user.getUsername());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new LoginResponse("Login successful!",user.getUsername(),user.getEmail(),token));
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        try {
            userService.verifyEmail(token);
            return ResponseEntity.ok("Email verified successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

}
