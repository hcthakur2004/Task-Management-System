function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} type="button">
      <span>{theme === "light" ? "Lights off" : "Lights on"}</span>
    </button>
  );
}

export default ThemeToggle;
