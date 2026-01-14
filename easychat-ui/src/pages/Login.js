import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureECCKeys, uploadPublicKey } from "./Crypto";
import "./Auth.css";
import API_BASE from "../config/api";

function Login() {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const res = await fetch(
                `${API_BASE}/easychat/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ usernameOrEmail, password }),
                }
            );

            if (!res.ok) throw new Error("Invalid credentials");

            const data = await res.json();
            localStorage.setItem("token", data.token.trim());

            await ensureECCKeys();
            await uploadPublicKey();

            navigate("/Chat");
        } catch {
            setMsg("Login failed. Check credentials.(or Verify Email)");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleLogin}>
                <h2 className="auth-title">🔐 EasyChat Login</h2>

                <input
                    className="auth-input"
                    placeholder="Username or Email"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
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
                    {loading ? "Signing in…" : "Login"}
                </button>

                <p className="auth-footer">
                    Don’t have an account?{" "}
                    <span
                        className="auth-link"
                        onClick={() => navigate("/Register")}
                    >
                        Register
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Login;
