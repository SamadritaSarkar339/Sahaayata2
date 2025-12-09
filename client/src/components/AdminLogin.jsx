import React, { useState } from "react";
import { api, setAuthToken } from "../api";

const AdminLogin = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/auth/login", form);
      const { token, user } = res.data;

      setAuthToken(token);
      onLoginSuccess(user);
    } catch (err) {
      console.error("Admin login error:", err);
      alert(
        err.response?.data?.message || "Login failed. Check email/password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <h3>Admin Login</h3>
      <label>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="admin@example.com"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="********"
        />
      </label>
      <button type="submit" disabled={loading} className="primary-btn">
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default AdminLogin;
