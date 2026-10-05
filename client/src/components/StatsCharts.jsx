import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label,
  BarChart, Bar, XAxis, YAxis, LabelList,
} from "recharts";

const STATUS = { todo: "To Do", inprogress: "In Progress", done: "Done" };
const STATUS_COLORS = { todo: "#94a3b8", inprogress: "#f59e0b", done: "#10b981" };
const PRIORITY_COLORS = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };

const textColor = { fill: "var(--text)", fontSize: 13, fontWeight: 600 };

export default function StatsCharts({ stats }) {
  const statusData = ["todo", "inprogress", "done"].map((k) => ({
    key: k,
    name: STATUS[k],
    value: stats.byStatus.find((s) => s._id === k)?.count || 0,
  }));
  const priorityData = ["low", "medium", "high"].map((k) => ({
    key: k,
    name: k.charAt(0).toUpperCase() + k.slice(1),
    value: stats.byPriority.find((s) => s._id === k)?.count || 0,
  }));
  const total = statusData.reduce((a, b) => a + b.value, 0);

  if (!total) return <div className="empty">Add some tasks to see charts here.</div>;

  return (
    <div className="charts">
      <div className="card">
        <h4>Tasks by status</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={85}
              paddingAngle={3}
              label={({ value }) => (value > 0 ? value : "")}
              labelLine={false}
              style={textColor}
            >
              {statusData.map((d) => (
                <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
              ))}
              <Label
                value={`${total} tasks`}
                position="center"
                style={{ fill: "var(--text)", fontSize: 15, fontWeight: 700 }}
              />
            </Pie>
            <Tooltip />
            <Legend formatter={(value, entry) => `${value}: ${entry.payload.value}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h4>Tasks by priority</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={priorityData} margin={{ top: 20 }}>
            <XAxis dataKey="name" tick={{ fill: "var(--muted)" }} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--muted)" }} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {priorityData.map((d) => (
                <Cell key={d.key} fill={PRIORITY_COLORS[d.key]} />
              ))}
              <LabelList dataKey="value" position="top" style={textColor} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}