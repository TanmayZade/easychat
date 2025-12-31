// ===== DOM ELEMENTS =====
const receiverInput = document.getElementById("receiver");
const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");

// ===== STATE =====
let stompClient = null;
let isConnected = false;

// ===== CONNECT WEBSOCKET ON PAGE LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    connectWebSocket();
});

// ===== LOAD CHAT HISTORY =====
function getChatHistory() {
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

    fetch(`/easychat/api/chat/history?otherUser=${encodeURIComponent(otherUser)}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to load history");
            return res.json();
        })
        .then(data => {
            messages.innerHTML = "";
            data.forEach(m => {
                appendMessage(m.sender, m.content);
            });
        })
        .catch(err => console.error(err));
}

// ===== CONNECT WEBSOCKET (ONCE) =====
function connectWebSocket() {
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

            stompClient.subscribe("/user/queue/messages", msg => {
                const m = JSON.parse(msg.body);
                appendMessage(m.sender, m.content);
            });
        },
        error => {
            console.error("❌ WebSocket error:", error);
            isConnected = false;
        }
    );
}

// ===== SEND MESSAGE =====
function sendMessage() {
    if (!stompClient || !isConnected) {
        alert("WebSocket not connected yet");
        return;
    }

    if (!messageInput.value.trim()) return;
    if (!receiverInput.value.trim()) return;

    stompClient.send(
        "/app/chat.send",
        {},
        JSON.stringify({
            receiver: receiverInput.value,
            content: messageInput.value
        })
    );

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
