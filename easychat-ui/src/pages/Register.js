import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const res = await fetch(
                "http://localhost:8080/easychat/api/auth/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username,
                        name,
                        password,
                        email,
                    }),
                }
            );

            if (!res.ok) throw new Error("Registration failed");

            const data = await res.json();
            setMsg("✅ Registration successful! Redirecting to login...");

            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setMsg("❌ Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleRegister}>
                <h2 className="auth-title">📝 Create Account</h2>

                <input
                    className="auth-input"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    className="auth-input"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className="password-wrapper">
                    <input
                        className="auth-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                {msg && <div className="auth-error">{msg}</div>}

                <button className="auth-btn" disabled={loading}>
                    {loading ? "Creating account…" : "Register"}
                </button>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <span
                        className="auth-link"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Register;
