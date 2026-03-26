import { useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setForm(initialForm);
    setError("");
  };

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <span className="eyebrow">TaskFlow Workspace</span>
        <h1>Keep the messy middle of work somewhere visible.</h1>
        <p>
          TaskFlow is a compact personal board for deadlines, half-finished
          ideas, and the things you really do not want to forget by Friday.
        </p>
        <div className="hero-pills">
          <span>Personal board</span>
          <span>Progress snapshot</span>
          <span>Search and filters</span>
          <span>Late-night friendly</span>
        </div>
        <div className="auth-note">
          <div className="auth-note__line">
            <strong>Today&apos;s rhythm</strong>
            <span>Plan, ship, tidy up.</span>
          </div>
          <div className="auth-note__line">
            <strong>What this app is good at</strong>
            <span>Small teams, solo work, quick check-ins.</span>
          </div>
          <div className="auth-note__line">
            <strong>Built with</strong>
            <span>React, Express, MongoDB, and a little restraint.</span>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</span>
            <h2>{mode === "login" ? "Login" : "Sign up"}</h2>
          </div>
          <button className="button button--ghost" onClick={switchMode} type="button">
            {mode === "login" ? "Create one instead" : "Back to login"}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label className="field">
              <span>Name</span>
              <input
                minLength="2"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </label>
          ) : null}

          <label className="field">
            <span>Email</span>
            <input
              name="email"
              required
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              minLength="6"
              name="password"
              required
              type="password"
              value={form.password}
              onChange={handleChange}
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button className="button button--primary" disabled={loading} type="submit">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
