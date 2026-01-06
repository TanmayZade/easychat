import {
    getReceiverPublicKey,
    deriveAESKey,
    encryptMessage,
    decryptMessage,
    getUsernameFromJWT,
    ensureECCKeys, uploadPublicKey
} from "./crypto.js"
// ===== DOM ELEMENTS =====
const receiverInput = document.getElementById("receiver");
const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");

// ===== STATE =====
let stompClient = null;
let isConnected = false;

// ===== CONNECT WEBSOCKET ON PAGE LOAD =====
document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("sendMessage").addEventListener("click",sendMessage );

    document.getElementById("logout").addEventListener("click",logout);

    document.getElementById("startChat").addEventListener("click",getChatHistory);

    await ensureECCKeys();

    await uploadPublicKey();

    connectWebSocket();
});

// ===== LOAD CHAT HISTORY =====
async function getChatHistory() {
    const token = localStorage.getItem("token")?.trim();
    const otherUser = receiverInput.value;

    if (!token) {
        alert("Please login again");
        window.location.href = "/easychat/auth/login.html";
        return;
    }

    if (!otherUser) {
        alert("Enter receiver name");
        return;
    }

    const res = await fetch(`/easychat/api/chat/history?otherUser=${encodeURIComponent(otherUser)}`,
        {
            headers:{
                "Authorization": "Bearer " + token
            }
        });

    const messages =await res.json();
    clearMessages();

    for(const m of messages){
        try{
            const peer = (m.sender === getUsernameFromJWT())? m.receiver : m.sender;

            const peerPubKey = await getReceiverPublicKey(peer);

            const AESKey = await deriveAESKey(peerPubKey);

            const plainText = await decryptMessage(m.cipherText, m.iv, AESKey);

            appendMessage(m.sender, plainText);

        }catch (e){
            console.log("History Decryption failed!",e);
        }
    }




    // fetch(`/easychat/api/chat/history?otherUser=${encodeURIComponent(otherUser)}`, {
    //     headers: {
    //         "Authorization": "Bearer " + token
    //     }
    // })
    //     .then(res => {
    //         if (!res.ok) throw new Error("Failed to load history");
    //         return res.json();
    //     })
    //     .then(data => {
    //         messages.innerHTML = "";
    //         data.forEach(m => {
    //             appendMessage(m.sender, m.content);
    //         });
    //     })
    //     .catch(err => console.error(err));
}

// ===== CONNECT WEBSOCKET (ONCE) =====
async function connectWebSocket() {
    const token = localStorage.getItem("token")?.trim();

    if (!token) {
        alert("Please login again");
        window.location.href = "/easychat/auth/login.html";
        return;
    }

    // prevent duplicate connections
    if (stompClient && isConnected) return;

    const socket = new SockJS("/easychat/ws-chat");
    stompClient = Stomp.over(socket);

    // optional: disable verbose logs
    stompClient.debug = null;

    stompClient.connect(
        { Authorization: "Bearer " + token },
        () => {
            console.log("✅ WebSocket connected");
            isConnected = true;

            stompClient.subscribe("/user/queue/messages", async msg => {
                const m = JSON.parse(msg.body);

                try {
                    const senderPublicKey = await getReceiverPublicKey(m.sender);

                    const AESKey = await deriveAESKey(senderPublicKey);

                    const plainText = await decryptMessage(m.cipherText, m.iv, AESKey);
                    appendMessage(m.sender, plainText);
                }catch (e){
                    console.error("Decryption failed!",e);
                }

            });
        },
        error => {
            console.error("❌ WebSocket error:", error);
            isConnected = false;
        }
    );
}

// ===== SEND MESSAGE =====
async function sendMessage() {
    const receiverInput = document.getElementById("receiver");
    const messageInput = document.getElementById("message");

    const receiver = receiverInput.value.trim();
    const text = messageInput.value.trim();

    if (!stompClient || !isConnected) {
        alert("WebSocket not connected yet");
        return;
    }

    if (!receiver || !text) return;

    //1) get receivers public key
    const recPublicKey = await getReceiverPublicKey(receiver);

    //2) derive AES KEY
    const AESKey = await deriveAESKey(recPublicKey);

    //3) encrypt the message
    const {cipherText, iv} = await encryptMessage(text,AESKey);

    stompClient.send(
        "/app/chat.send",
        {},
        JSON.stringify({
            receiver: receiver,
            cipherText: cipherText,
            iv: iv
        })
    );
    appendMessage(getUsernameFromJWT(), text);
    messageInput.value = "";
}

// ===== HELPER =====
function appendMessage(sender, content) {
    const li = document.createElement("li");
    li.innerText = `${sender}: ${content}`;
    messages.appendChild(li);

    // auto-scroll
    messages.scrollTop = messages.scrollHeight;
}
function logout() {

    // 1. Disconnect WebSocket safely
    if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
            console.log("WebSocket disconnected");
        });
    }

    // 2. Remove JWT
    localStorage.removeItem("token");

    // (optional but clean)
    localStorage.clear();

    // 3. Redirect to login page
    window.location.href = "/easychat/login.html";
}
function clearMessages() {
    document.getElementById("messages").innerHTML = "";
}
