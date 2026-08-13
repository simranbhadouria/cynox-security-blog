import "./AdminLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid email or password");
                return;
            }

            localStorage.setItem("adminToken", data.token);

            navigate("/admin/blogs");

        } catch (error) {
            console.error("Login error:", error);
            setError("Unable to connect to server");
        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-card">

                <div className="admin-login-header">

                    <div className="admin-login-icon">
                        🔐
                    </div>

                    <h1>Admin Portal</h1>

                    <p>
                        Sign in to manage your blogs
                    </p>

                </div>

                <form onSubmit={handleLogin}>

                    <div className="login-field">

                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter admin email"
                            required
                        />

                    </div>

                    <div className="login-field">

                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />

                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Login
                    </button>

                </form>

                <div className="login-footer">
                    Secure Admin Access
                </div>

            </div>

        </div>
    );
}
export default AdminLogin;