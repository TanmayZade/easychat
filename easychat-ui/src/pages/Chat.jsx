import {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import "./Chat.css";
import API_BASE from "../config/api";
import {
    getReceiverPublicKey,
    deriveAESKey,
    encryptMessage,
    decryptMessage,
    getUsernameFromJWT,
    ensureECCKeys,
    uploadPublicKey
} from "./Crypto";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {WS_URL} from "../config/ws";

function Chat(){
    const navigate = useNavigate();

    //State
    const [receiver, setReceiver] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [newChatUser, setNewChatUser] = useState("");
    const [startChatError, setStartChatError] = useState("");
    const [checkingUser, setCheckingUser] = useState(false);

    //Websocket Ref
    const stompClientRef = useRef(null);
    const connectedRef = useRef(false);
    const subscriptionRef = useRef(null);
    const activeReceiverRef = useRef("");

    //for updating current receiver in websocket
    useEffect(() => {
        activeReceiverRef.current = receiver;
    }, [receiver]);

    useEffect(() => {
        if (newChatUser.trim() === "") {
            setStartChatError("");
        }
    }, [newChatUser]);

    //Auth + init
    useEffect(() =>{
        const token = localStorage.getItem("token");
        if(!token){
            navigate("/login");
        }

        async function init(){
            try{
                await ensureECCKeys();
                await uploadPublicKey();
                await loadContacts();
                connectWebSocket();
            }catch (e){
                console.error("Init failed",e);
            }
        }

        init();

        return () => {
            subscriptionRef.current?.unsubscribe();
            stompClientRef.current?.deactivate();
            stompClientRef.current = null;
        };
    },[navigate]);

    //load contacts
    async function loadContacts() {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_BASE}/easychat/api/chat/contacts`,
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            if (!res.ok) {
                const text = await res.text();
                console.error("Contacts API failed:", text);
                setContacts([]);
                return;
            }

            const data = await res.json();   // ✅ data defined HERE
            console.log("RAW contacts response:", data);

            if (Array.isArray(data)) {
                setContacts(data);
            } else if (data && Array.isArray(data.contacts)) {
                setContacts(data.contacts);
            } else {
                console.error("Unexpected contacts format:", data);
                setContacts([]);
            }

        } catch (err) {
            console.error("Failed to load contacts", err);
            setContacts([]);
        }
    }

    //Connect Websocket

    function connectWebSocket() {
        if (stompClientRef.current?.connected) return;

        const token = localStorage.getItem("token");

        const client = new Client({
            webSocketFactory: () =>
                new SockJS(WS_URL),
            connectHeaders: {
                Authorization: "Bearer " + token,
            },
            reconnectDelay: 5000,
            debug: () => {},

            onConnect: () => {
                connectedRef.current = true;
                stompClientRef.current = client;

                subscriptionRef.current = client.subscribe(
                    "/user/queue/messages",
                    async (msg) => {
                        const m = JSON.parse(msg.body);
                        const myUsername = getUsernameFromJWT();

                        // Ignore own messages
                        if (m.sender === myUsername) return;

                        // Decrypt
                        const senderKey = await getReceiverPublicKey(m.sender);
                        const AESKey = await deriveAESKey(senderKey);
                        let text;

                        try {
                            text = await decryptMessage(m.cipherText, m.iv, AESKey);
                        } catch (err) {
                            console.warn("Decryption failed (likely new device login)", err);

                            text = "🔒 Message cannot be decrypted on this device";
                        }

                        // Ensure contact exists
                        setContacts((prev) =>
                            prev.includes(m.sender) ? prev : [...prev, m.sender]
                        );

                        // ✅ USE REF, NOT STATE
                        if (m.sender === activeReceiverRef.current) {
                            setMessages((prev) => [
                                ...prev,
                                { sender: m.sender, content: text }
                            ]);
                        } else {
                            alert(`🔔 New message from ${m.sender}`);
                        }
                    }
                );

            },

            onStompError: (frame) => {
                console.error("STOMP error", frame);
            },
        });

        client.activate();
    }



    //Load Chat History
    async function loadChatHistory(user = receiver){
        if(!user){
            alert("Enter receiver name");
            return;
        }

        const token = localStorage.getItem("token");
        const res = await fetch(
            `${API_BASE}/easychat/api/chat/history?otherUser=${encodeURIComponent(user)}`,
            {
                headers: { Authorization: "Bearer " + token }
            }
        );
        if (!res.ok) {
            const text = await res.text();
            console.error("History API error:", text);
            return;
        }
        const history = await res.json();
        setMessages([]);

        for(const m of history){
            try{
                const peer =
                    m.sender === getUsernameFromJWT() ? m.receiver : m.sender;

                const peerPubKey = await getReceiverPublicKey(peer);
                const AESKey = await deriveAESKey(peerPubKey);
                const plainText = await decryptMessage(
                    m.cipherText,
                    m.iv,
                    AESKey
                );

                setMessages((prev) => [
                    ...prev,
                    { sender: m.sender, content: plainText }
                ]);
            }catch (e){
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: m.sender,
                        content: "🔒 Message cannot be decrypted on this device"
                    }
                ]);
            }
        }

    }

    //openchat with particular user
    async function openChat(username){
        activeReceiverRef.current = username;
        setReceiver(username);
        setMessages([]);
        await loadChatHistory(username);
    }

    //start new chat
    async function startNewChat() {
        if (!newChatUser) return;

        setStartChatError("");
        setCheckingUser(true);

        try {
            const result = await checkUserExists(newChatUser);

            if (!result.exists) {
                setStartChatError("❌ username does not exist");
                return;
            }

            // ✅ User exists & verified
            activeReceiverRef.current = newChatUser;
            setReceiver(newChatUser);
            setMessages([]);

            // Optionally add to contacts list immediately
            if (!contacts.includes(newChatUser)) {
                setContacts(prev => [...prev, newChatUser]);
            }

            setNewChatUser("");

        } catch (err) {
            setStartChatError("⚠️ Unable to verify user. Try again.");
        } finally {
            setCheckingUser(false);
        }
    }

    // SEND Message
    async function sendMessage(){
        if(!connectedRef.current){
            alert("Websocket not connected");
            return;
        }

        if(!receiver || !message) {
            return;
        }

        try{
            const recPubKey = await getReceiverPublicKey(receiver);
            const AESKey = await deriveAESKey(recPubKey);
            const {cipherText, iv} = await encryptMessage(message, AESKey);

            stompClientRef.current.publish({
                destination: "/app/chat.send",
                body: JSON.stringify({
                    receiver,
                    cipherText,
                    iv
                })
            });

            setMessages((prev) => [
                ...prev,
                { sender: getUsernameFromJWT(), content: message }
            ]);
            if (!contacts.includes(receiver)) {
                setContacts((prev) => [...prev, receiver]);
            }

            setMessage("");
        }catch (e){
            console.log("Couldn't send message");
        }
    }

    // ===== LOGOUT =====
    function logout() {
        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
        }
        localStorage.removeItem("token");

        // localStorage.clear();
        navigate("/login");
    }

    async function checkUserExists(username) {
        const token = localStorage.getItem("token");

        const res = await fetch(
            `${API_BASE}/easychat/api/chat/exists?username=${encodeURIComponent(username)}`,
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        if (!res.ok) {
            throw new Error("User check failed");
        }

        return await res.json(); // { exists: true/false }
    }


    // ===== UI =====
    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <h3>🔐 EasyChat</h3>
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>

            {/* Body */}
            <div className="chat-body">
                {/* Left Panel */}
                {/* Left Panel */}
                <div className="chat-sidebar">
                    <h4>Chats</h4>

                    {contacts.length === 0 && (
                        <p className="empty-text">No chats yet</p>
                    )}

                    {contacts.map((u) => (
                        <div
                            key={u}
                            className={`contact ${receiver === u ? "active" : ""}`}
                            onClick={() => openChat(u)}
                        >
                            {u}
                        </div>
                    ))}

                    <hr />

                    <input

                        placeholder="Start new chat"
                        value={newChatUser}
                        onChange={(e) => setNewChatUser(e.target.value)}
                    />
                    <button onClick={startNewChat}>Start</button>
                    {startChatError && (
                        <p className="error-text">{startChatError}</p>
                    )}

                    {checkingUser && (
                        <p className="info-text">Checking user...</p>
                    )}
                </div>


                {/* Chat Area */}
                <div className="chat-main">
                    <div className="chat-title">
                        {receiver ? (
                            <h4>Chatting with {receiver}</h4>
                        ) : (
                            <h4>Select a chat</h4>
                        )}
                    </div>
                    <div className="messages">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={
                                    m.sender === getUsernameFromJWT()
                                        ? "message outgoing"
                                        : "message incoming"
                                }
                            >
                                <span>{m.content}</span>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="chat-input">
                        <input
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Chat;


