import { useEffect, useMemo, useState } from "react";

import { analyticsApi, taskApi } from "../api/client.js";
import AnalyticsPanel from "../components/AnalyticsPanel.jsx";
import Pagination from "../components/Pagination.jsx";
import StatsCards from "../components/StatsCards.jsx";
import TaskFormModal from "../components/TaskFormModal.jsx";
import TaskList from "../components/TaskList.jsx";
import TaskToolbar from "../components/TaskToolbar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";

const initialFilters = {
  status: "All",
  priority: "All",
  search: "",
  sortBy: "dueDate",
  order: "asc",
};

const emptyAnalytics = {
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  overdueTasks: 0,
  completionPercentage: 0,
  byStatus: [],
  byPriority: [],
};

const formatLongDate = () =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

function DashboardPage() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [filters, setFilters] = useState(initialFilters);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1 });
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [banner, setBanner] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [savingTask, setSavingTask] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const focusTask = useMemo(() => {
    return [...tasks]
      .filter((task) => task.status !== "Done")
      .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))[0];
  }, [tasks]);

  const progressMessage = useMemo(() => {
    if (!analytics.totalTasks) {
      return "No tasks yet. Start with one clear task and the board will take shape.";
    }
    if (analytics.completionPercentage >= 80) {
      return "Strong pace. Most of the board is already moving toward done.";
    }
    if (analytics.overdueTasks > 0) {
      return `A little attention needed: ${analytics.overdueTasks} item${analytics.overdueTasks > 1 ? "s are" : " is"} overdue.`;
    }
    return "Everything looks steady. A few quick updates should keep this board healthy.";
  }, [analytics]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "6",
      sortBy: filters.sortBy,
      order: filters.order,
    });

    if (filters.status !== "All") {
      params.set("status", filters.status);
    }
    if (filters.priority !== "All") {
      params.set("priority", filters.priority);
    }
    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    return `?${params.toString()}`;
  }, [filters, page]);

  useEffect(() => {
    const controller = new AbortController();
    setTasksLoading(true);
    setTasksError("");

    taskApi
      .getTasks(queryString, token, controller.signal)
      .then((data) => {
        setTasks(data.tasks);
        setPagination(data.pagination);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setTasksError(error.message);
        }
      })
      .finally(() => {
        setTasksLoading(false);
      });

    return () => controller.abort();
  }, [queryString, refreshKey, token]);

  useEffect(() => {
    setAnalyticsLoading(true);

    analyticsApi
      .getAnalytics(token)
      .then((data) => {
        setAnalytics(data.analytics);
      })
      .catch((error) => {
        setBanner(error.message);
      })
      .finally(() => {
        setAnalyticsLoading(false);
      });
  }, [refreshKey, token]);

  const refreshData = () => {
    setRefreshKey((current) => current + 1);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleOpenCreate = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async (payload) => {
    setSavingTask(true);
    setBanner("");

    try {
      if (selectedTask) {
        await taskApi.updateTask(selectedTask._id, payload, token);
        setBanner("Task updated successfully.");
      } else {
        await taskApi.createTask(payload, token);
        setBanner("Task created successfully.");
      }

      handleCloseModal();
      refreshData();
    } catch (error) {
      setBanner(error.message);
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm("Delete this task permanently?");
    if (!confirmed) {
      return;
    }

    try {
      await taskApi.deleteTask(taskId, token);
      setBanner("Task deleted.");
      refreshData();
    } catch (error) {
      setBanner(error.message);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      await taskApi.toggleTaskCompletion(taskId, token);
      setBanner("Task status updated.");
      refreshData();
    } catch (error) {
      setBanner(error.message);
    }
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero-grid">
        <header className="dashboard-header workspace-card">
          <div>
            <span className="eyebrow">Your desk for today</span>
            <p className="dashboard-date">{formatLongDate()}</p>
            <h1>{user?.name}&apos;s task board</h1>
            <p>{progressMessage}</p>
          </div>

          <div className="header-actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button className="button button--ghost" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <aside className="focus-card">
          <span className="focus-card__label">Next thing worth touching</span>
          {focusTask ? (
            <>
              <h2>{focusTask.title}</h2>
              <p>
                {focusTask.description
                  ? focusTask.description
                  : "No description yet, which is honestly sometimes a mood."}
              </p>
              <div className="focus-card__meta">
                <span>{focusTask.priority} priority</span>
                <span>Due {new Date(focusTask.dueDate).toLocaleDateString("en-IN")}</span>
              </div>
            </>
          ) : (
            <>
              <h2>Nothing urgent on the board.</h2>
              <p>
                Either you&apos;re caught up, or this is the perfect moment to add the
                next real task instead of keeping it in your head.
              </p>
              <div className="focus-card__meta">
                <span>{analytics.completedTasks} completed</span>
                <span>{analytics.pendingTasks} still open</span>
              </div>
            </>
          )}
        </aside>
      </section>

      {banner ? <div className="info-banner">{banner}</div> : null}

      {analyticsLoading ? (
        <div className="panel-state">Loading analytics...</div>
      ) : (
        <>
          <StatsCards analytics={analytics} />
          <AnalyticsPanel analytics={analytics} />
        </>
      )}

      <TaskToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onOpenCreate={handleOpenCreate}
        isRefreshing={tasksLoading}
      />

      <section className="section-heading section-heading--space">
        <div>
          <h2>Board View</h2>
          <span className="muted-text">
            {pagination.totalPages > 1
              ? `Showing page ${pagination.page} of ${pagination.totalPages}`
              : "Every matching task is visible here"}
          </span>
        </div>
      </section>

      <TaskList
        tasks={tasks}
        loading={tasksLoading}
        error={tasksError}
        onEdit={handleEdit}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
      />

      <Pagination
        page={pagination.page || page}
        totalPages={pagination.totalPages || 1}
        onChange={setPage}
      />

      <TaskFormModal
        open={modalOpen}
        task={selectedTask}
        onClose={handleCloseModal}
        onSubmit={handleSaveTask}
        isSubmitting={savingTask}
      />
    </main>
  );
}

export default DashboardPage;
