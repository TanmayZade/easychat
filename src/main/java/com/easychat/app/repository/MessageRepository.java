package com.easychat.app.repository;

import com.easychat.app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findBySenderAndReceiverOrSenderAndReceiverOrderByTimestampAsc(
            String sender1, String receiver1,
            String sender2, String receiver2
    );
}
