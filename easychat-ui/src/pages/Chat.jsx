import {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import "./Chat.css";

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

function Chat(){
    const navigate = useNavigate();
    const API_BASE = "http://localhost:8080";

    //State
    const [receiver, setReceiver] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    //Websocket Ref
    const stompClientRef = useRef(null);
    const connectedRef = useRef(false);
    const subscriptionRef = useRef(null);

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

    //Connect Websocket

    function connectWebSocket() {
        if (stompClientRef.current?.connected) return;

        const token = localStorage.getItem("token");

        const client = new Client({
            webSocketFactory: () =>
                new SockJS("http://localhost:8080/easychat/ws-chat"),
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
                        console.log("WS RECEIVED", msg.body, Date.now());

                        const myUsername = getUsernameFromJWT();
                        if (m.sender === myUsername) {
                            return;
                        }
                        if (m.sender != receiver) {
                            alert(`New message from user ${m.sender}`);
                            return;
                        }
                        const senderKey = await getReceiverPublicKey(m.sender);
                        const AESKey = await deriveAESKey(senderKey);
                        const text = await decryptMessage(m.cipherText, m.iv, AESKey);

                        setMessages((prev) => [
                            ...prev,
                            { sender: m.sender, content: text },
                        ]);
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
    async function loadChatHistory(){
        if(!receiver){
            alert("Enter receiver name");
            return;
        }

        const token = localStorage.getItem("token");
        const res = await fetch(
            `${API_BASE}/easychat/api/chat/history?otherUser=${encodeURIComponent(receiver)}`,
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
                console.log("History decryption failed for ",e);
            }
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


    // ===== UI =====
    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <h3>🔐 Secure Chat</h3>
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>

            {/* Body */}
            <div className="chat-body">
                {/* Left Panel */}
                <div className="chat-sidebar">
                    <input
                        className="receiver-input"
                        placeholder="Receiver username"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                    />
                    <button className="start-btn" onClick={loadChatHistory}>
                        Start Chat
                    </button>
                </div>

                {/* Chat Area */}
                <div className="chat-main">
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


