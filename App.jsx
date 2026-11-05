
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard, CheckCircle2, Clock3, Circle,
  Plus, Search, Trash2, Edit3, Moon, Sun,
  CalendarDays, TrendingUp, X, Menu, Settings,
  ListTodo, ChevronLeft, ChevronRight, Save
} from "lucide-react";
import "./App.css";

const columns = ["Todo", "In Progress", "Done"];

const initialTasks = [
  { id: 1, title: "Design landing page", category: "Design", priority: "High", status: "In Progress", date: "2026-11-04" },
  { id: 2, title: "Build authentication system", category: "Development", priority: "High", status: "Todo", date: "2026-11-05" },
  { id: 3, title: "Create dashboard UI", category: "Design", priority: "Medium", status: "Done", date: "2026-11-04" },
  { id: 4, title: "Write project documentation", category: "Planning", priority: "Low", status: "Todo", date: "2026-11-06" },
  { id: 5, title: "Fix responsive layout", category: "Development", priority: "Medium", status: "In Progress", date: "2026-11-07" }
];

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("taskora-tasks");
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [profile, setProfile] = useState({
    name: "Momina Developer",
    email: "momina@example.com",
    role: "Frontend Developer"
  });

  const [form, setForm] = useState({
    title: "",
    category: "Development",
    priority: "Medium",
    status: "Todo",
    date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    localStorage.setItem("taskora-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const completed = tasks.filter(t => t.status === "Done").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const todo = tasks.filter(t => t.status === "Todo").length;
  const progress = tasks.length
    ? Math.round(completed / tasks.length * 100)
    : 0;

  const initials = profile.name
    .split(" ")
    .map(x => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "All" || t.category === filter) &&
    (page !== "My Tasks" || t.status !== "Done")
  );

  const navigate = name => {
    setPage(name);
    setMobileMenu(false);
    setSearch("");
  };

  const openAdd = (date = new Date().toISOString().slice(0, 10)) => {
    setEditing(null);
    setForm({
      title: "",
      category: "Development",
      priority: "Medium",
      status: "Todo",
      date
    });
    setShowModal(true);
  };

  const openEdit = task => {
    setEditing(task.id);
    setForm({ ...task });
    setShowModal(true);
  };

  const saveTask = e => {
    e.preventDefault();

    if (!form.title.trim()) return;

    if (editing !== null) {
      setTasks(prev => prev.map(t =>
        t.id === editing ? { ...t, ...form } : t
      ));
    } else {
      setTasks(prev => [
        { ...form, id: Date.now() },
        ...prev
      ]);
    }

    setShowModal(false);
  };

  const deleteTask = id => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const moveTask = (id, status) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status } : t
    ));
  };

  const dateString = day =>
    `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const calendarDays = () => {
    const first = new Date(
      month.getFullYear(),
      month.getMonth(),
      1
    ).getDay();

    const total = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();

    return [
      ...Array(first).fill(null),
      ...Array.from({ length: total }, (_, i) => i + 1)
    ];
  };

  const renderTask = task => (
    <article className="task-card" key={task.id} draggable
      onDragStart={e =>
        e.dataTransfer.setData("taskId", task.id)
      }>
      <div className="task-meta">
        <span className={`category ${task.category.toLowerCase()}`}>
          {task.category}
        </span>

        <button className="icon-btn" onClick={() => openEdit(task)}>
          <Edit3 size={15}/>
        </button>
      </div>

      <h3>{task.title}</h3>

      <div className="task-date">
        <CalendarDays size={12}/> {task.date}
      </div>

      <div className="task-footer">
        <span className={`priority ${task.priority.toLowerCase()}`}>
          <Circle size={7} fill="currentColor"/>
          {task.priority}
        </span>

        <button className="delete-btn" onClick={() => deleteTask(task.id)}>
          <Trash2 size={15}/>
        </button>
      </div>

      <select
        className="status-select"
        value={task.status}
        onChange={e => moveTask(task.id, e.target.value)}
      >
        {columns.map(c => <option key={c}>{c}</option>)}
      </select>
    </article>
  );

  const renderBoard = () => (
    <>
      <div className="filters">
        <div className="search-box">
          <Search size={17}/>
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option>
          <option>Design</option>
          <option>Development</option>
          <option>Planning</option>
        </select>
      </div>

      <div className="kanban">
        {columns.map((column, index) => {
          const list = filteredTasks.filter(t => t.status === column);

          return (
            <div
              className="kanban-column"
              key={column}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const id = Number(e.dataTransfer.getData("taskId"));
                if (id) moveTask(id, column);
              }}
            >
              <div className="column-title">
                <div className={`column-dot dot-${index}`}/>
                <strong>{column}</strong>
                <span>{list.length}</span>
              </div>

              <div className="task-list">
                {list.map(renderTask)}

                {!list.length && (
                  <div className="empty-state">No tasks here yet</div>
                )}
              </div>

              <button className="add-column-task" onClick={() => openAdd()}>
                <Plus size={15}/> Add a task
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderCalendar = () => (
    <div className="calendar-layout">
      <section className="calendar-panel">
        <div className="calendar-toolbar">
          <div>
            <h2>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
              })}
            </h2>
            <p>Choose a date to view tasks.</p>
          </div>

          <div className="calendar-arrows">
            <button className="outline-btn"
              onClick={() => setMonth(new Date(
                month.getFullYear(), month.getMonth() - 1, 1
              ))}>
              <ChevronLeft/>
            </button>

            <button className="outline-btn"
              onClick={() => setMonth(new Date())}>
              Today
            </button>

            <button className="outline-btn"
              onClick={() => setMonth(new Date(
                month.getFullYear(), month.getMonth() + 1, 1
              ))}>
              <ChevronRight/>
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div className="calendar-weekday" key={d}>{d}</div>
          ))}

          {calendarDays().map((day, i) => {
            if (!day) return <div className="calendar-empty" key={i}/>;

            const date = dateString(day);
            const count = tasks.filter(t => t.date === date).length;

            return (
              <button
                key={date}
                className={`calendar-day ${selectedDate === date ? "selected" : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                <span>{day}</span>
                {count > 0 && <small>{count} tasks</small>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="selected-day-panel">
        <div className="section-heading">
          <div>
            <h2>{selectedDate}</h2>
            <p>Scheduled tasks</p>
          </div>

          <button className="primary-btn" onClick={() => openAdd(selectedDate)}>
            <Plus size={16}/> Add
          </button>
        </div>

        <div className="selected-task-list">
          {tasks.filter(t => t.date === selectedDate).map(renderTask)}
        </div>
      </section>
    </div>
  );

  const renderAnalytics = () => (
    <>
      <div className="stats">
        {[
          ["Total Tasks", tasks.length],
          ["Completed", completed],
          ["In Progress", inProgress],
          ["Productivity", progress + "%"]
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <TrendingUp/>
            </div>
            <h2>{value}</h2>
            <small>Live workspace data</small>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <section className="analytics-panel">
          <h2>Task distribution</h2>

          {["Design", "Development", "Planning"].map(category => {
            const count = tasks.filter(t => t.category === category).length;

            return (
              <div className="bar-row" key={category}>
                <span>{category}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{
                    width: `${tasks.length ? count / tasks.length * 100 : 0}%`
                  }}/>
                </div>
                <strong>{count}</strong>
              </div>
            );
          })}
        </section>

        <section className="analytics-panel">
          <h2>Completion overview</h2>

          <div className="progress-circle" style={{
            "--progress": `${progress}%`
          }}>
            <div className="progress-inner">
              <strong>{progress}%</strong>
              <small>Completed</small>
            </div>
          </div>

          <p>Todo: {todo} | In progress: {inProgress} | Done: {completed}</p>
        </section>
      </div>
    </>
  );

  const renderProfile = () => (
    <section className="profile-settings">
      <div className="profile-cover">
        <div className="large-avatar">{initials}</div>
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.role}</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={e => {
        e.preventDefault();
        localStorage.setItem("taskora-profile", JSON.stringify(profile));
        alert("Profile updated successfully!");
      }}>
        <h2>Personal Information</h2>
        <p>Update your workspace profile.</p>

        <label>Full name</label>
        <input required value={profile.name}
          onChange={e => setProfile({
            ...profile, name: e.target.value
          })}/>

        <label>Email address</label>
        <input type="email" required value={profile.email}
          onChange={e => setProfile({
            ...profile, email: e.target.value
          })}/>

        <label>Job title</label>
        <input required value={profile.role}
          onChange={e => setProfile({
            ...profile, role: e.target.value
          })}/>

        <button className="primary-btn" type="submit">
          <Save size={16}/> Save Profile
        </button>
      </form>
    </section>
  );

  return (
    <div className={dark ? "app dark" : "app light"}>
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><CheckCircle2/></div>
          <span>taskora<span className="dot">.</span></span>

          <button className="mobile-close"
            onClick={() => setMobileMenu(false)}>
            <X/>
          </button>
        </div>

        <div className="side-label">WORKSPACE</div>

        {[
          ["Dashboard", LayoutDashboard],
          ["My Tasks", ListTodo],
          ["Calendar", CalendarDays],
          ["Analytics", TrendingUp]
        ].map(([name, Icon]) => (
          <button
            key={name}
            className={`nav-item ${page === name ? "active" : ""}`}
            onClick={() => navigate(name)}
          >
            <Icon size={19}/>
            {name}
            {name === "My Tasks" && (
              <span className="nav-count">{tasks.length}</span>
            )}
          </button>
        ))}

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${page === "Profile" ? "active" : ""}`}
            onClick={() => navigate("Profile")}
          >
            <Settings size={18}/> Settings
          </button>

          <button className="profile" onClick={() => navigate("Profile")}>
            <div className="avatar">{initials}</div>
            <div className="profile-text">
              <strong>{profile.name}</strong>
              <small>{profile.role}</small>
            </div>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-btn"
            onClick={() => setMobileMenu(!mobileMenu)}>
            <Menu/>
          </button>

          <div className="breadcrumb">
            Workspace / <strong>{page}</strong>
          </div>

          <div className="top-actions">
            <button className="theme-btn"
              onClick={() => setDark(!dark)}>
              {dark ? <Sun/> : <Moon/>}
            </button>

            <button className="avatar avatar-button"
              onClick={() => navigate("Profile")}>
              {initials}
            </button>
          </div>
        </header>

        <section className="content">
          <div className="welcome">
            <div>
              <div className="eyebrow">YOUR WORKSPACE</div>

              <h1>
                {page === "Dashboard"
                  ? `Good day, ${profile.name.split(" ")[0]}`
                  : page}
              </h1>

              <p>Manage your projects and stay productive.</p>
            </div>

            {page !== "Analytics" && page !== "Profile" && (
              <button className="primary-btn"
                onClick={() => openAdd(selectedDate)}>
                <Plus size={18}/> New Task
              </button>
            )}
          </div>

          {page === "Dashboard" && (
            <>
              <div className="stats">
                {[
                  ["Total Tasks", tasks.length, LayoutDashboard],
                  ["Completed", completed, CheckCircle2],
                  ["In Progress", inProgress, Clock3],
                  ["Productivity", progress + "%", TrendingUp]
                ].map(([label, value, Icon]) => (
                  <div className="stat-card" key={label}>
                    <div className="stat-top">
                      <span>{label}</span>
                      <div className="stat-icon purple"><Icon/></div>
                    </div>
                    <h2>{value}</h2>
                    <small>Workspace overview</small>
                  </div>
                ))}
              </div>

              <div className="workspace-grid">
                <section className="board-section">
                  <div className="section-heading">
                    <div>
                      <h2>Project Board</h2>
                      <p>Manage your daily tasks.</p>
                    </div>

                    <button className="outline-btn"
                      onClick={() => navigate("My Tasks")}>
                      View all
                    </button>
                  </div>

                  {renderBoard()}
                </section>

                <aside className="progress-panel">
                  <h2>Overview</h2>
                  <p>Your productivity at a glance.</p>

                  <div className="progress-circle" style={{
                    "--progress": `${progress}%`
                  }}>
                    <div className="progress-inner">
                      <strong>{progress}%</strong>
                      <small>Completed</small>
                    </div>
                  </div>

                  <div className="progress-info">
                    <div>
                      <span className="legend purple-bg"/>
                      Total tasks <strong>{tasks.length}</strong>
                    </div>
                    <div>
                      <span className="legend green-bg"/>
                      Completed <strong>{completed}</strong>
                    </div>
                    <div>
                      <span className="legend orange-bg"/>
                      Remaining <strong>{tasks.length - completed}</strong>
                    </div>
                  </div>

                  <div className="tip-card">
                    <span>✦ Daily tip</span>
                    <p>Focus on one important task at a time. Small steps create big results.</p>
                  </div>
                </aside>
              </div>
            </>
          )}

          {page === "My Tasks" && (
            <section className="board-section">
              <div className="section-heading">
                <div>
                  <h2>My Active Tasks</h2>
                  <p>Manage and track your tasks.</p>
                </div>
              </div>
              {renderBoard()}
            </section>
          )}

          {page === "Calendar" && renderCalendar()}
          {page === "Analytics" && renderAnalytics()}
          {page === "Profile" && renderProfile()}
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay"
          onClick={() => setShowModal(false)}>
          <form className="modal"
            onClick={e => e.stopPropagation()}
            onSubmit={saveTask}>

            <div className="modal-header">
              <h2>{editing !== null ? "Edit Task" : "Create New Task"}</h2>

              <button type="button" className="icon-btn"
                onClick={() => setShowModal(false)}>
                <X/>
              </button>
            </div>

            <label>Task title</label>
            <input required autoFocus
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => setForm({
                ...form, title: e.target.value
              })}/>

            <label>Category</label>
            <select value={form.category}
              onChange={e => setForm({
                ...form, category: e.target.value
              })}>
              <option>Development</option>
              <option>Design</option>
              <option>Planning</option>
            </select>

            <label>Priority</label>
            <select value={form.priority}
              onChange={e => setForm({
                ...form, priority: e.target.value
              })}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <label>Status</label>
            <select value={form.status}
              onChange={e => setForm({
                ...form, status: e.target.value
              })}>
              {columns.map(c => <option key={c}>{c}</option>)}
            </select>

            <label>Due date</label>
            <input type="date" value={form.date}
              onChange={e => setForm({
                ...form, date: e.target.value
              })}/>

            <button className="primary-btn submit-btn" type="submit">
              {editing !== null ? "Save Changes" : "Create Task"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

