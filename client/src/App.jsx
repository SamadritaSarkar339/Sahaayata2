import React, { useEffect, useState } from "react";
import { api, setAuthToken } from "./api";
import QueryForm from "./components/QueryForm";
import QueryList from "./components/QueryList";
import AdminLogin from "./components/AdminLogin";
import AdminAnalytics from "./components/AdminAnalytics";
import SignUp from "./components/SignUp";

const App = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("sahaayata_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sahaayata_theme", theme);
  }, [theme]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/queries");
      setQueries(res.data);
    } catch (err) {
      console.error("Error fetching queries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
    const saved = localStorage.getItem("sahaayata_user");
    if (saved) setUser(JSON.parse(saved));
    const tok = localStorage.getItem("sahaayata_token");
    if (tok) {
      setAuthToken(tok);
      // optionally fetch user info to populate adminUser
    }
  }, []);

  const handleNewQuery = (newQuery) => {
    setQueries((prev) => [newQuery, ...prev]);
  };

  const handleLoginSuccess = (user) => setAdminUser(user);
  const handleLogout = () => {
    setAdminUser(null);
    setAuthToken(null);
  };

  const handleDeleteQuery = async (id) => {
    if (!window.confirm("Delete this query permanently?")) return;
    try {
      await api.delete(`/queries/${id}`);
      setQueries((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert(err.response?.data?.message || "Failed to delete.");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-main">
          <div>
            <h1>Sahaayata</h1>
            <p>AI-powered navigator for public welfare schemes & benefits.</p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ fontSize: ".9rem" }}>
              {user ? <span>Welcome, <strong>{user.name}</strong></span> : <span>Guest</span>}
            </div>

            <button
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              title="Toggle theme"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            <div className="admin-box">
              {adminUser ? (
                <>
                  <span className="admin-label">Admin: {adminUser.name}</span>
                  <button className="secondary-btn" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <span className="admin-label">Admin: Not logged in</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="form-section">
          <h2>Describe your situation</h2>
          <QueryForm onCreated={handleNewQuery} />
          <div className="admin-section">
            <hr />
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <SignUp onSignUp={setUser} />
          </div>
        </section>

        <section className="list-section">
          <div className="list-header">
            <h2>Recent anonymous queries & AI guidance</h2>
            {loading && <span className="badge">Loading...</span>}
          </div>

          <QueryList queries={queries} isAdmin={!!adminUser} onDelete={handleDeleteQuery} />

          {adminUser && (
            <>
              <hr className="analytics-divider" />
              <AdminAnalytics />
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <small>
          ⚠️ This is AI-based guidance. Verify final details on official government websites or offices.
        </small>
      </footer>
    </div>
  );
};

export default App;
