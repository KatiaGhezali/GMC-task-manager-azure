import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TaskCard from "../components/TaskCard";

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Retrieve the authenticated user's tasks
  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data.data.tasks);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError("Unable to load tasks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchTasks();
  }, []);

  // Create a new task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/tasks", {
        title,
        description,
      });

      setTitle("");
      setDescription("");

      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create task.");
    }
  };

  // Delete a task
  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete task.");
    }
  };

  // Log out and clear the authentication cookie
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Task Manager</h1>
          <p>Welcome, {user?.name || "User"}!</p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <section className="task-form-section">
          <h2>Add a New Task</h2>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit} className="task-form">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />

            <textarea
              placeholder="Task description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />

            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="tasks-section">
          <h2>Your Tasks ({tasks.length})</h2>

          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty-message">
              You don't have any tasks yet. Add your first task!
            </p>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
