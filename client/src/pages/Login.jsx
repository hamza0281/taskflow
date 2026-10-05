import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth">
      <div className="auth-side">
        <h1>TaskFlow</h1>
        <p>Plan projects, assign tasks and track progress with your team on a simple drag-and-drop board.</p>
        <ul>
          <li>✅ Kanban task boards</li>
          <li>👥 Invite teammates by email</li>
          <li>🔒 Secure JWT login</li>
        </ul>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-box">
          <h2>Welcome back</h2>
          <p className="sub">Log in to continue to your projects</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <button type="submit">Login</button>
          </form>
          <p className="switch">New here? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}