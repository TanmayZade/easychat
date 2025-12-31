function register() {
    const username = document.getElementById("username").value;
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const msgEl = document.getElementById("msg");

    fetch("/easychat/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, password, email })
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Registration failed");
            }
            return res.json();
        })
        .then(data => {
            msgEl.innerText = data.message;
            // redirect after success
            setTimeout(() => {
                window.location.href = "/easychat/login.html";
            }, 1000);
        })
        .catch(err => {
            console.error(err);
            msgEl.innerText = "Registration failed";
        });
}
