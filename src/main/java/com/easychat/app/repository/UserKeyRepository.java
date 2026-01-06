package com.easychat.app.repository;

import com.easychat.app.model.UserKey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserKeyRepository extends JpaRepository<UserKey, String> {
    boolean existsByUsername(String username);
}
