import React, { useEffect, useState } from "react";
import { api } from "../api";

const normalizeStats = (arr) => {
  if (!arr || arr.length === 0) return [];
  const max = Math.max(...arr.map((a) => a.count || 0)) || 1;
  return arr.map((item) => ({
    label: item._id || "Unknown",
    count: item.count,
    width: `${(item.count / max) * 100}%`
  }));
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/analytics/summary");
      setData(res.data);
    } catch (err) {
      console.error("Analytics fetch error", err);
      setError(
        err.response?.data?.message || "Failed to load analytics (admin only)."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="analytics-card">
        <p>Loading analytics…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="analytics-card">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const langStats = normalizeStats(data.byLanguage || []);
  const catStats = normalizeStats(data.byCategory || []);
  const locStats = normalizeStats(data.byLocation || []);

  const langLabel = (code) => {
    if (code === "hi") return "Hindi";
    if (code === "bn") return "Bengali";
    if (code === "en") return "English";
    return code || "Unknown";
  };

  return (
    <div className="analytics-card">
      <div className="analytics-header">
        <h3>Admin Analytics</h3>
        <button className="secondary-btn" onClick={fetchAnalytics}>
          Refresh
        </button>
      </div>

      <div className="analytics-grid">
        <div className="analytics-panel">
          <h4>Total Queries</h4>
          <p className="big-number">{data.totalQueries}</p>
        </div>

        <div className="analytics-panel">
          <h4>By Language</h4>
          {langStats.length === 0 ? (
            <p className="muted">No data yet.</p>
          ) : (
            <ul className="bar-list">
              {langStats.map((item) => (
                <li key={item.label}>
                  <div className="bar-label-row">
                    <span>{langLabel(item.label)}</span>
                    <span className="bar-count">{item.count}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: item.width }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="analytics-panel">
          <h4>Top Categories</h4>
          {catStats.length === 0 ? (
            <p className="muted">No categories yet.</p>
          ) : (
            <ul className="bar-list">
              {catStats.map((item) => (
                <li key={item.label}>
                  <div className="bar-label-row">
                    <span>{item.label}</span>
                    <span className="bar-count">{item.count}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: item.width }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="analytics-panel">
          <h4>Top Locations</h4>
          {locStats.length === 0 ? (
            <p className="muted">No locations yet.</p>
          ) : (
            <ul className="bar-list">
              {locStats.map((item) => (
                <li key={item.label}>
                  <div className="bar-label-row">
                    <span>{item.label}</span>
                    <span className="bar-count">{item.count}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: item.width }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
