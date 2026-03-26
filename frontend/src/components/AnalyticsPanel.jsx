const formatLabel = (value) => value || "Unknown";

function DistributionChart({ title, items }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <article className="analytics-card">
      <div className="section-heading">
        <h3>{title}</h3>
        <span>{total} tracked</span>
      </div>
      <div className="distribution-list">
        {items.length ? (
          items.map((item) => {
            const width = total ? Math.max((item.count / total) * 100, 8) : 0;
            return (
              <div className="distribution-row" key={item._id}>
                <div className="distribution-row__meta">
                  <span>{formatLabel(item._id)}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="distribution-row__track">
                  <div
                    className="distribution-row__fill"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="muted-text">No data yet. Create a few tasks to see trends.</p>
        )}
      </div>
    </article>
  );
}

function AnalyticsPanel({ analytics }) {
  return (
    <section className="analytics-grid">
      <article className="analytics-card analytics-card--spotlight">
        <div className="section-heading">
          <h3>Progress Snapshot</h3>
          <span>{analytics.completedTasks} crossed off</span>
        </div>
        <div className="progress-ring">
          <div
            className="progress-ring__inner"
            style={{
              background: `conic-gradient(var(--accent-primary) ${analytics.completionPercentage}%, var(--surface-muted) 0)`,
            }}
          >
            <div className="progress-ring__content">
              <strong>{analytics.completionPercentage}%</strong>
              <span>completion</span>
            </div>
          </div>
        </div>
        <div className="overview-inline">
          <span>Overdue: {analytics.overdueTasks}</span>
          <span>Open: {analytics.pendingTasks}</span>
        </div>
      </article>

      <DistributionChart title="How Work Is Split" items={analytics.byStatus} />
      <DistributionChart title="Priority Mix" items={analytics.byPriority} />
    </section>
  );
}

export default AnalyticsPanel;
