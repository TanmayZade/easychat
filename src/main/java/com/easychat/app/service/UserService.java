package com.easychat.app.service;

import com.easychat.app.config.PasswordConfig;
import com.easychat.app.dto.RegisterRequest;
import com.easychat.app.exception.AuthenticationException;
import com.easychat.app.model.User;
import com.easychat.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

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
    }

    public User authenticate(String usernameOrEmail, String password){
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail,usernameOrEmail)
                .orElseThrow(() -> new AuthenticationException("Username or Email is invalid!"));

        if(!passwordEncoder.matches(password, user.getPassword())){
            throw new AuthenticationException("Wrong Password");
        }

        return user;
    }

}
