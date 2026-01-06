


import {ensureECCKeys, uploadPublicKey} from "./crypto.js";
document.getElementById("loginBtn").addEventListener("click",login);

async function login() {
    const usernameOrEmail = document.getElementById("usernameOrEmail").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("msg");

    try {
        const res = await fetch("/easychat/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernameOrEmail, password })
        });

        const data = await res.json();

        console.log("LOGIN RESPONSE:", data);
        localStorage.setItem("token", data.token.trim());

        // IMPORTANT: wait for crypto + upload
        await onLoginSuccess();

        window.location.href = "/easychat/chat.html";

    } catch (e) {
        msg.innerText = "Login Failed";
    }
}


async function onLoginSuccess(){
    await ensureECCKeys();
    await uploadPublicKey();
}


