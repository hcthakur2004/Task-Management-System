const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function TaskList({
  tasks,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleComplete,
}) {
  if (loading) {
    return <div className="panel-state">Loading tasks...</div>;
  }

  if (error) {
    return <div className="panel-state panel-state--error">{error}</div>;
  }

  if (!tasks.length) {
    return (
      <div className="panel-state">
        Nothing matches these filters right now. Try clearing a filter or add the next task on your list.
      </div>
    );
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <article className="task-card" key={task._id}>
          <div className="task-card__header">
            <div>
              <h3>{task.title}</h3>
              <p>{task.description || "No description added yet."}</p>
            </div>
            <span
              className={`badge badge--${task.status.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {task.status}
            </span>
          </div>

          <div className="task-meta">
            <span className={`chip chip--${task.priority.toLowerCase()}`}>
              {task.priority} priority
            </span>
            <span>Due {formatDate(task.dueDate)}</span>
          </div>

          <div className="task-actions">
            <button
              className="button button--ghost"
              onClick={() => onToggleComplete(task._id)}
              type="button"
            >
              {task.status === "Done" ? "Reopen" : "Mark Done"}
            </button>
            <button
              className="button button--ghost"
              onClick={() => onEdit(task)}
              type="button"
            >
              Edit
            </button>
            <button
              className="button button--danger"
              onClick={() => onDelete(task._id)}
              type="button"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default TaskList;
