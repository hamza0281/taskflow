import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) return setSlow(false);
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Enter your email and password");
    submit(form);
  };

  // fills a demo account; create it once by registering demo@taskflow.com / demo1234
  const useDemo = () => {
    const demo = { email: "demo@taskflow.com", password: "demo1234" };
    setForm(demo);
    submit(demo);
  };

  return (
    <AuthShell>
      <h2>Welcome back 👋</h2>
      <p className="sub">Log in to continue to your projects</p>

      <form onSubmit={handleSubmit}>
        <div className="field-icon">
          <Mail size={18} />
          <input name="email" type="email" placeholder="Email address"
            value={form.email} onChange={handleChange} autoComplete="email" />
        </div>
        <div className="field-icon">
          <Lock size={18} />
          <input name="password" type={show ? "text" : "password"} placeholder="Password"
            value={form.password} onChange={handleChange} autoComplete="current-password" />
          <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button type="submit" className="main-btn" disabled={loading}>
          {loading ? <span className="spinner" /> : <LogIn size={18} />}
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {slow && <p className="wake">The free server is waking up, this can take up to a minute…</p>}

      <div className="divider"><span>or</span></div>
      <button type="button" className="btn-ghost demo-btn" onClick={useDemo} disabled={loading}>
        <Sparkles size={16} /> Try demo account
      </button>

      <p className="switch">New here? <Link to="/register">Create an account</Link></p>
    </AuthShell>
  );
}