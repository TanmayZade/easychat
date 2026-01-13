package com.easychat.app.service;

import com.easychat.app.exception.PublicKeyAlreadyExistException;
import com.easychat.app.exception.PublicKeyNotFoundException;
import com.easychat.app.model.UserKey;
import com.easychat.app.repository.UserKeyRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserKeyService {

    private final UserKeyRepository repository;
    @Transactional
    public void savePublicKey(String username, String jwk) {
        if (repository.existsById(username)) {
            throw new PublicKeyAlreadyExistException(username);
        }

            UserKey key = new UserKey();
            key.setUsername(username);
            key.setPublicKeyJwk(jwk);
            repository.save(key);

    }


    public String getPublicKeyJson(String username) {
        return repository.findById(username)
                .orElseThrow(() -> new PublicKeyNotFoundException(username))
                .getPublicKeyJwk();
    }
}
