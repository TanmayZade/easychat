function login(){
    const usernameOrEmail = document.getElementById("usernameOrEmail").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("msg");

    fetch("/easychat/api/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ usernameOrEmail, password})
    })
        .then(res => res.json())
        .then(data => {
            console.log("LOGIN RESPONSE:", data);
            localStorage.setItem("token", data.token.trim());
            console.log("TOKEN STORED:", localStorage.getItem("token"));
            window.location.href = "/easychat/chat.html"
        })
        .catch(() => msg.innerText = "Login Failed");
}