import { Link } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck, BarChart3, Zap, MessageSquare } from "lucide-react";

const features = [
  { icon: LayoutDashboard, title: "Kanban boards", text: "Drag and drop tasks between To Do, In Progress and Done." },
  { icon: Users, title: "Team collaboration", text: "Invite teammates by email and assign tasks to them." },
  { icon: Zap, title: "Real-time updates", text: "See changes from your teammates instantly, no refresh needed." },
  { icon: MessageSquare, title: "Comments", text: "Discuss each task right where the work happens." },
  { icon: BarChart3, title: "Insightful charts", text: "Track progress by status and priority on your dashboard." },
  { icon: ShieldCheck, title: "Secure by design", text: "JWT authentication, hashed passwords and protected routes." },
];

export default function Landing() {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="logo">TaskFlow</span>
          <div className="nav-right">
            <Link to="/login" className="link-btn btn-ghost">Login</Link>
            <Link to="/register" className="link-btn primary">Get started</Link>
          </div>
        </div>
      </nav>

      <header className="landing-hero">
        <h1>Manage projects with <span>clarity and speed</span></h1>
        <p>TaskFlow helps your team plan work, assign tasks and track progress on a simple, real-time board.</p>
        <div className="cta">
          <Link to="/register" className="link-btn primary">Create free account</Link>
          <Link to="/login" className="link-btn btn-ghost">I already have one</Link>
        </div>
      </header>

      <section className="features">
        {features.map((f) => (
          <div className="feature" key={f.title}>
            <div className="ico"><f.icon size={22} /></div>
            <h4>{f.title}</h4>
            <p>{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}