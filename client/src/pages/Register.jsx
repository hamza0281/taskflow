import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
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
          <h2>Create your account</h2>
          <p className="sub">Start managing your projects in seconds</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <button type="submit">Register</button>
          </form>
          <p className="switch">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}