import { useState } from "react";
import { X, Trash2, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

export default function TaskModal({ task, members, onClose, onChange, onDelete }) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    assignedTo: task.assignedTo?._id || "",
  });
  const [comments, setComments] = useState(task.comments || []);
  const [comment, setComment] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    try {
      const res = await api.put(`/tasks/${task._id}`, form);
      onChange(res.data);
      toast.success("Task updated");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, { text: comment });
      setComments(res.data.comments);
      setComment("");
      onChange(res.data);
    } catch {
      toast.error("Could not add comment");
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Task details</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={set("title")} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={form.description} onChange={set("description")} placeholder="Add more details..." />
        </div>
        <div className="two field">
          <div>
            <label>Status</label>
            <select value={form.status} onChange={set("status")}>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select value={form.priority} onChange={set("priority")}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="two field">
          <div>
            <label>Assigned to</label>
            <select value={form.assignedTo} onChange={set("assignedTo")}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label>Due date</label>
            <input type="date" value={form.dueDate} onChange={set("dueDate")} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-danger" onClick={() => onDelete(task._id)}><Trash2 size={16} /> Delete</button>
          <button onClick={save}>Save changes</button>
        </div>

        <div className="comments">
          <h4 style={{ marginBottom: 10 }}>Comments ({comments.length})</h4>
          {comments.map((c) => (
            <div className="comment" key={c._id}>
              <small>{c.user?.name || "User"} · {new Date(c.createdAt).toLocaleString()}</small>
              {c.text}
            </div>
          ))}
          <form className="comment-form" onSubmit={addComment}>
            <input placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit"><Send size={16} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}