import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { Search, Pencil, Trash2, MessageSquare, Calendar, X } from "lucide-react";
import api, { SERVER_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "#94a3b8" },
  { id: "inprogress", title: "In Progress", color: "#f59e0b" },
  { id: "done", title: "Done", color: "#10b981" },
];

const isOverdue = (t) => t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date();

export default function ProjectBoard() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: "", priority: "medium", dueDate: "", assignedTo: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [filters, setFilters] = useState({ q: "", priority: "", assignee: "", overdue: false });

  const load = async () => {
    try {
      const [p, t, a] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/projects/${id}/activity`),
      ]);
      setProject(p.data);
      setTasks(t.data);
      setActivity(a.data);
    } catch {
      toast.error("Could not load project");
      navigate("/");
    }
  };

  useEffect(() => { load(); }, [id]);

  // real-time: refresh whenever a teammate changes something
  useEffect(() => {
    const socket = io(SERVER_URL);
    socket.emit("join", id);
    socket.on("project:update", () => load());
    return () => socket.disconnect();
  }, [id]);

  const isOwner = project && project.owner._id === user._id;

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Enter a task title");
    const body = { title: form.title, priority: form.priority, project: id };
    if (form.dueDate) body.dueDate = form.dueDate;
    if (form.assignedTo) body.assignedTo = form.assignedTo;
    try {
      await api.post("/tasks", body);
      setForm({ title: "", priority: "medium", dueDate: "", assignedTo: "" });
      toast.success("Task added");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add task");
    }
  };

  const onDragEnd = async ({ destination, draggableId }) => {
    if (!destination) return;
    const newStatus = destination.droppableId;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task || task.status === newStatus) return;

    setTasks(tasks.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t)));
    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch {
      toast.error("Could not move task");
      load();
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
      setSelected(null);
      toast.success("Task deleted");
    } catch {
      toast.error("Could not delete task");
    }
  };

  const updateInList = (updated) =>
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

  const addMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail("");
      toast.success("Member added");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add member");
    }
  };

  const removeMember = async (m) => {
    if (!window.confirm(`Remove ${m.name} from this project?`)) return;
    try {
      await api.delete(`/projects/${id}/members/${m._id}`);
      toast.success("Member removed");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove member");
    }
  };

  const renameProject = async () => {
    const name = window.prompt("Rename project", project.name);
    if (!name || !name.trim()) return;
    try {
      await api.put(`/projects/${id}`, { name });
      toast.success("Project renamed");
      load();
    } catch {
      toast.error("Could not rename");
    }
  };

  const deleteProject = async () => {
    if (!window.confirm("Delete this project and all its tasks? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted");
      navigate("/");
    } catch {
      toast.error("Could not delete project");
    }
  };

  if (!project) {
    return (<><Navbar /><div className="page"><div className="skeleton" /></div></>);
  }

  const visible = tasks.filter((t) => {
    if (filters.q && !t.title.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.assignee === "unassigned" && t.assignedTo) return false;
    if (filters.assignee && filters.assignee !== "unassigned" && t.assignedTo?._id !== filters.assignee) return false;
    if (filters.overdue && !isOverdue(t)) return false;
    return true;
  });

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const filtersOn = filters.q || filters.priority || filters.assignee || filters.overdue;

  return (
    <>
      <Navbar />
      <div className="page">
        <Link to="/" className="back">&larr; All projects</Link>

        <div className="board-head">
          <div>
            <h2>
              {project.name}
              {isOwner && <span className="badge-owner">Owner</span>}
            </h2>
            <div className="progress"><div style={{ width: `${percent}%` }} /></div>
            <small style={{ color: "var(--muted)" }}>{percent}% complete ({doneCount}/{tasks.length} tasks)</small>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="avatars">
              {project.members.map((m) => (
                <span className="avatar" key={m._id} title={m.name}>{m.name[0]}</span>
              ))}
            </div>
            {isOwner && (
              <div className="head-actions">
                <button className="icon-btn" title="Rename project" onClick={renameProject}><Pencil size={16} /></button>
                <button className="icon-btn" title="Delete project" onClick={deleteProject}><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <form onSubmit={addTask} className="row">
            <input placeholder="New task title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {project.members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <button type="submit">+ Add task</button>
          </form>

          <div className="row">
            <div className="search">
              <Search size={16} />
              <input placeholder="Search tasks..." value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
            </div>
            <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}>
              <option value="">Everyone</option>
              <option value="unassigned">Unassigned</option>
              {project.members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <label className="check">
              <input type="checkbox" checked={filters.overdue}
                onChange={(e) => setFilters({ ...filters, overdue: e.target.checked })} />
              Overdue only
            </label>
            {filtersOn && (
              <button className="btn-ghost"
                onClick={() => setFilters({ q: "", priority: "", assignee: "", overdue: false })}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="board">
            {COLUMNS.map((col) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div className={`column ${snapshot.isDraggingOver ? "over" : ""}`}
                    ref={provided.innerRef} {...provided.droppableProps}>
                    <h4>
                      <span className="dot" style={{ background: col.color }} />
                      {col.title}
                      <span className="count">{visible.filter((t) => t.status === col.id).length}</span>
                    </h4>
                    {visible.filter((t) => t.status === col.id).map((task, index) => (
                      <Draggable draggableId={task._id} index={index} key={task._id}>
                        {(prov, snap) => (
                          <div className={`task ${task.priority} ${snap.isDragging ? "dragging" : ""}`}
                            ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                            onClick={() => setSelected(task)}>
                            <strong>{task.title}</strong>
                            <div className="meta">
                              <div className="meta-left">
                                <span className={`badge ${task.priority}`}>{task.priority}</span>
                                {task.dueDate && (
                                  <span className={`due ${isOverdue(task) ? "overdue" : ""}`}>
                                    <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                {task.comments?.length > 0 && (
                                  <span className="cmt"><MessageSquare size={12} /> {task.comments.length}</span>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                {task.assignedTo && (
                                  <span className="avatar sm" title={task.assignedTo.name}>{task.assignedTo.name[0]}</span>
                                )}
                                <button className="del" title="Delete"
                                  onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        <div className="panels">
          <div className="card">
            <h4>Team ({project.members.length})</h4>
            {project.members.map((m) => (
              <div className="person" key={m._id}>
                <span className="avatar sm">{m.name[0]}</span>
                <div className="grow">
                  {m.name}
                  {m._id === project.owner._id && <span className="badge-owner">Owner</span>}
                  <br /><small>{m.email}</small>
                </div>
                {isOwner && m._id !== project.owner._id && (
                  <button className="del" title="Remove member" onClick={() => removeMember(m)}><X size={14} /></button>
                )}
              </div>
            ))}
            {isOwner && (
              <form onSubmit={addMember} className="row" style={{ marginTop: 14 }}>
                <input type="email" placeholder="Invite by email" value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)} />
                <button type="submit" className="btn-ghost">Add</button>
              </form>
            )}
          </div>

          <div className="card">
            <h4>Recent activity</h4>
            {activity.length === 0 && <small style={{ color: "var(--muted)" }}>No activity yet.</small>}
            {activity.map((a) => (
              <div className="activity-item" key={a._id}>
                {a.message}
                <small>{new Date(a.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <TaskModal
          task={selected}
          members={project.members}
          onClose={() => setSelected(null)}
          onChange={updateInList}
          onDelete={deleteTask}
        />
      )}
    </>
  );
}