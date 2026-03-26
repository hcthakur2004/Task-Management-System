function StatsCards({ analytics }) {
  const cards = [
    {
      label: "On the board",
      value: analytics.totalTasks,
      accent: "var(--accent-primary)",
    },
    {
      label: "Wrapped up",
      value: analytics.completedTasks,
      accent: "var(--accent-success)",
    },
    {
      label: "Still moving",
      value: analytics.pendingTasks,
      accent: "var(--accent-warning)",
    },
    {
      label: "Finish rate",
      value: `${analytics.completionPercentage}%`,
      accent: "var(--accent-secondary)",
    },
  ];

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article className="stat-card" key={card.label}>
          <span className="stat-card__label">{card.label}</span>
          <strong className="stat-card__value">{card.value}</strong>
          <span className="stat-card__hint">
            {card.label === "Finish rate" ? "A quick pulse check" : "Live from your tasks"}
          </span>
          <span
            className="stat-card__bar"
            style={{ background: card.accent }}
            aria-hidden="true"
          />
        </article>
      ))}
    </section>
  );
}

export default StatsCards;
