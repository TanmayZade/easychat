import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import API_BASE from "../config/api";

function Register() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const usernameRegex = /^[a-z0-9]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    const navigate = useNavigate();

    function validateUsername(value) {
        if (!value) {
            setUsernameError("Username is required");
        } else if (!usernameRegex.test(value)) {
            setUsernameError("Only lowercase letters and numbers allowed");
        } else {
            setUsernameError("");
        }
    }

    function validatePassword(value) {
        if (!value) {
            setPasswordError("Password is required");
        } else if (!passwordRegex.test(value)) {
            setPasswordError(
                "Min 8 chars, at least 1 letter and 1 number"
            );
        } else {
            setPasswordError("");
        }
    }



    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const res = await fetch(
                `${API_BASE}/easychat/api/auth/register`,
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
            setShowVerifyModal(true);
        } catch (err) {
            setMsg("❌ Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    }

    const isFormValid =
        !usernameError &&
        !passwordError &&
        username &&
        password &&
        email;

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleRegister}>
                <h2 className="auth-title">📝 Create Account</h2>
                <input
                    className={`auth-input ${usernameError ? "input-error" : ""}`}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        setUsername(val);
                        validateUsername(val);
                    }}
                    onBlur={(e) => validateUsername(e.target.value)}
                />

                {usernameError && (
                    <small className="field-error">{usernameError}</small>
                )}


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
                        className={`auth-input ${passwordError ? "input-error" : ""}`}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            validatePassword(e.target.value);
                        }}
                        onBlur={(e) => validatePassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                {passwordError && (
                    <small className="field-error">{passwordError}</small>
                )}


                {msg && <div className="auth-error">{msg}</div>}

                <button className="auth-btn" disabled={loading || !isFormValid}>
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
            {showVerifyModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>📧 Verify your email</h3>

                        <p>
                            We’ve sent a verification link to your email address.
                        </p>

                        <ul className="verify-steps">
                            <li>Open your inbox</li>
                            <li>Click the verification link</li>
                            <li>Return here to log in</li>
                        </ul>

                        <p className="verify-note">
                            ⚠️ If you don’t see the email, check your <b>Spam</b> or <b>Promotions</b> folder.
                        </p>

                        <button
                            className="auth-btn"
                            onClick={() => navigate("/login")}
                        >
                            OK, go to Login
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Register;
