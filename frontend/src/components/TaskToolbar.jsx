function TaskToolbar({
  filters,
  onFilterChange,
  onOpenCreate,
  isRefreshing,
}) {
  return (
    <section className="toolbar-card">
      <div className="toolbar-grid">
        <label className="field">
          <span>Search</span>
          <input
            name="search"
            placeholder="Search by title"
            value={filters.search}
            onChange={onFilterChange}
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" value={filters.status} onChange={onFilterChange}>
            <option value="All">All</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </label>

        <label className="field">
          <span>Priority</span>
          <select
            name="priority"
            value={filters.priority}
            onChange={onFilterChange}
          >
            <option value="All">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <label className="field">
          <span>Sort By</span>
          <select name="sortBy" value={filters.sortBy} onChange={onFilterChange}>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>
        </label>

        <label className="field">
          <span>Order</span>
          <select name="order" value={filters.order} onChange={onFilterChange}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      <div className="toolbar-actions">
        <span className="muted-text">
          {isRefreshing
            ? "Refreshing the board..."
            : "Use this strip to narrow the noise and find what matters."}
        </span>
        <button className="button button--primary" type="button" onClick={onOpenCreate}>
          Add Task
        </button>
      </div>
    </section>
  );
}

export default TaskToolbar;
