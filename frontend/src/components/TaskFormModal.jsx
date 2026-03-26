import { useEffect, useState } from "react";

const getFormState = (task) => ({
  title: task?.title || "",
  description: task?.description || "",
  status: task?.status || "Todo",
  priority: task?.priority || "Medium",
  dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
});

function TaskFormModal({ open, onClose, onSubmit, task, isSubmitting }) {
  const [form, setForm] = useState(getFormState(task));

  useEffect(() => {
    if (open) {
      setForm(getFormState(task));
    }
  }, [open, task]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="section-heading">
          <h3 id="task-modal-title">{task ? "Update Task" : "Create Task"}</h3>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              required
              minLength="2"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              rows="4"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <div className="modal-grid">
            <label className="field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label className="field">
              <span>Due Date</span>
              <input
                required
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </label>
          </div>

          <button className="button button--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : task ? "Save Changes" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TaskFormModal;
