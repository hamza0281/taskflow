import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

const strength = (p) => {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
  return s; // 0 to 3
};

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) return setSlow(false);
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Please fill all fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const level = strength(form.password);
  const labels = ["", "Weak", "Good", "Strong"];

  return (
    <AuthShell>
      <h2>Create your account ✨</h2>
      <p className="sub">Start managing your projects in seconds</p>

      <form onSubmit={handleSubmit}>
        <div className="field-icon">
          <User size={18} />
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} autoComplete="name" />
        </div>
        <div className="field-icon">
          <Mail size={18} />
          <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} autoComplete="email" />
        </div>
        <div className="field-icon">
          <Lock size={18} />
          <input name="password" type={show ? "text" : "password"} placeholder="Password (min 6 characters)"
            value={form.password} onChange={handleChange} autoComplete="new-password" />
          <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {form.password && (
          <div className="strength">
            <div className="bars">
              {[1, 2, 3].map((i) => <span key={i} className={i <= level ? `on l${level}` : ""} />)}
            </div>
            <small>{labels[level] || "Too short"}</small>
          </div>
        )}

        <button type="submit" className="main-btn" disabled={loading}>
          {loading ? <span className="spinner" /> : <UserPlus size={18} />}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {slow && <p className="wake">The free server is waking up, this can take up to a minute…</p>}

      <p className="switch">Already have an account? <Link to="/login">Login</Link></p>
    </AuthShell>
  );
}