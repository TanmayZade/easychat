package com.easychat.app.repository;

import com.easychat.app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findBySenderAndReceiverOrSenderAndReceiverOrderByTimestampAsc(
            String sender1, String receiver1,
            String sender2, String receiver2
    );

    @Query("""
SELECT DISTINCT
    CASE
        WHEN m.sender = :username THEN m.receiver
        ELSE m.sender
    END
FROM Message m
WHERE m.sender = :username OR m.receiver = :username
""")
    List<String> findChatContacts(@Param("username") String username);
}
