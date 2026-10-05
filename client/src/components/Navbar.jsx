import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );

  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [dark]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">TaskFlow</Link>
        <div className="nav-right">
          <button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className="avatar">{user.name[0]}</span>
          <span className="hide-sm">{user.name}</span>
          <button className="btn-ghost" onClick={logout}><LogOut size={16} /> Logout</button>
        </div>
      </div>
    </nav>
  );
}