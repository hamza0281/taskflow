import { CheckCircle2, Users, Lock, Zap } from "lucide-react";

const perks = [
  { icon: CheckCircle2, text: "Drag and drop Kanban boards" },
  { icon: Users, text: "Invite teammates by email" },
  { icon: Zap, text: "Real-time updates" },
  { icon: Lock, text: "Secure JWT login" },
];

export default function AuthShell({ children }) {
  return (
    <div className="auth">
      <div className="auth-side">
        <span className="blob b1" />
        <span className="blob b2" />
        <h1 className="auth-logo">TaskFlow</h1>
        <p className="auth-tag">Plan projects, assign tasks and track progress with your team.</p>

        <div className="mini-board">
          <div className="mini-col">
            <small>To Do</small>
            <div className="mini-task t1"><i className="d high" />Design homepage</div>
            <div className="mini-task t2"><i className="d med" />Write API docs</div>
          </div>
          <div className="mini-col">
            <small>In Progress</small>
            <div className="mini-task t3"><i className="d med" />Build login page</div>
          </div>
          <div className="mini-col">
            <small>Done</small>
            <div className="mini-task t4"><i className="d low" />Set up database</div>
          </div>
        </div>

        <ul className="perks">
          {perks.map((p) => (
            <li key={p.text}><p.icon size={18} /> {p.text}</li>
          ))}
        </ul>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-box">{children}</div>
      </div>
    </div>
  );
}