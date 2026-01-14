package com.easychat.app.service;

import com.easychat.app.config.PasswordConfig;
import com.easychat.app.dto.RegisterRequest;
import com.easychat.app.exception.AuthenticationException;
import com.easychat.app.model.EmailVerificationToken;
import com.easychat.app.model.User;
import com.easychat.app.repository.EmailVerificationTokenRepository;
import com.easychat.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final EmailService emailService;
    public void registerUser(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new AuthenticationException("Email is already registered!");
        }

        if(userRepository.existsByUsername(request.getUsername())){
            throw new AuthenticationException("Username is already registered!");
        }

        User user = modelMapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        userRepository.save(user);

        String token = UUID.randomUUID().toString();

        EmailVerificationToken verificationToken =
                new EmailVerificationToken(
                        token,
                        user,
                        LocalDateTime.now().plusHours(24)
                );

        emailVerificationTokenRepository.save(verificationToken);

        //  Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
        } catch (Exception e) {
            // Log only – DO NOT throw
            System.err.println("Email failed on Render: " + e.getMessage());
        }
    }

    public User authenticate(String usernameOrEmail, String password){
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail,usernameOrEmail)
                .orElseThrow(() -> new AuthenticationException("Username or Email is invalid!"));

        if(!passwordEncoder.matches(password, user.getPassword())){
            throw new AuthenticationException("Wrong Password");
        }

        if(!user.isVerified()){
            throw new AuthenticationException("User not verified");
        }

        return user;
    }

    public void verifyEmail(String token) {

        EmailVerificationToken verificationToken =
                emailVerificationTokenRepository.findByToken(token)
                        .orElseThrow(() ->
                                new IllegalArgumentException("Invalid verification token"));

        if (verificationToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            emailVerificationTokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Verification token expired");
        }

        User user = verificationToken.getUser();
        user.setVerified(true);
        userRepository.save(user);

        emailVerificationTokenRepository.delete(verificationToken);
    }

    public boolean checkUsernameAndIsItVerified(String username){
        Optional<User> user = userRepository.findByUsername(username.trim().toLowerCase());
        if(user.isEmpty()) {
            System.out.println("Username is not present");
            return false;
        }

        if(user.get().isVerified()) {
            System.out.println("Username is present and verified");
            return true;
        }
        System.out.println("Username is present but not verified");

        return true;

    }

}
