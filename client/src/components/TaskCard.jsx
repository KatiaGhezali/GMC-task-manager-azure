function TaskCard({ task, onDelete }) {
  return (
    <div className="task-card">
      <div className="task-content">
        <h3>{task.title}</h3>
        <p>{task.description || "No description provided."}</p>

        <span
          className={`task-status ${task.completed ? "completed" : "pending"}`}
        >
          {task.completed ? "Completed" : "Pending"}
        </span>
      </div>

      <button className="delete-button" onClick={() => onDelete(task._id)}>
        Delete
      </button>
    </div>
  );
}

export default TaskCard;
