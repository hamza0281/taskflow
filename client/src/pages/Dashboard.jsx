import { useEffect, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
const StatsCharts = lazy(() => import("../components/StatsCharts"));

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"];

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });

  const [slow, setSlow] = useState(false);
useEffect(() => {
  const t = setTimeout(() => setSlow(true), 4000);
  return () => clearTimeout(t);
}, []);
const hour = new Date().getHours();
const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const load = async () => {
    try {
      const [p, s] = await Promise.all([api.get("/projects"), api.get("/projects/stats")]);
      setProjects(p.data);
      setStats(s.data);
    } catch {
      toast.error("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Enter a project name");
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "" });
      toast.success("Project created");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create project");
    }
  };

  const count = (k) => stats?.byStatus.find((s) => s._id === k)?.count || 0;
  const total = count("todo") + count("inprogress") + count("done");
  const pct = total ? Math.round((count("done") / total) * 100) : 0;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="hero">
          <h1>{greet}, {user.name} 👋</h1>
          <p>Here is an overview of your work.</p>
        </div>

        <div className="stats">
          <div className="stat"><div className="num">{projects.length}</div><div className="label">Projects</div></div>
          <div className="stat"><div className="num">{stats?.myOpenTasks ?? 0}</div><div className="label">My open tasks</div></div>
          <div className="stat"><div className="num" style={{ color: "#ef4444" }}>{stats?.overdue ?? 0}</div><div className="label">Overdue tasks</div></div>
          <div className="stat"><div className="num" style={{ color: "#10b981" }}>{pct}%</div><div className="label">Completed</div></div>
        </div>

        {loading && slow && (
  <p className="wake">The free server is waking up, this can take up to a minute…</p>
)}
{stats && (
  <Suspense fallback={<div className="skeleton" />}>
    <StatsCharts stats={stats} />
  </Suspense>
)}

        <div className="card" style={{ marginTop: 22 }}>
          <h3 style={{ marginBottom: 14 }}>Create a new project</h3>
          <form onSubmit={handleCreate} className="create-form">
            <input placeholder="Project name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Description (optional)" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button type="submit"><Plus size={16} /> Create</button>
          </form>
        </div>

        <h3 className="section-title">Your projects</h3>
        <div className="grid">
          {loading && [1, 2, 3].map((i) => <div className="skeleton" key={i} />)}
          {!loading && projects.length === 0 && (
            <div className="empty">No projects yet. Create your first one above.</div>
          )}
          {projects.map((p, i) => (
            <Link to={`/project/${p._id}`} key={p._id} className="project-card"
              style={{ borderTopColor: COLORS[i % COLORS.length] }}>
              <h4>
                {p.name}
                {p.owner._id === user._id && <span className="badge-owner">Owner</span>}
              </h4>
              <p>{p.description || "No description"}</p>
              <div className="avatars">
                {p.members.slice(0, 4).map((m) => (
                  <span className="avatar" key={m._id} title={m.name}>{m.name[0]}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}