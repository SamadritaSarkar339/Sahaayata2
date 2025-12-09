import React, { useState } from "react";
import { api } from "../api";

const QueryForm = ({ onCreated }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    situation: "",
    language: "en"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.situation.trim()) {
      alert("Please fill your name and situation.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/queries", form);
      onCreated(res.data);
      setForm({
        name: "",
        email: "",
        location: "",
        situation: "",
        language: "en"
      });
    } catch (err) {
      console.error("Error creating query", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="query-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label>
          Name*{" "}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your first name"
            required
          />
        </label>
        <label>
          Email (optional){" "}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="field-row">
        <label>
          Location (State/City){" "}
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Kolkata, West Bengal"
          />
        </label>

        <label>
          Response language
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </label>
      </div>

      <label className="field-full">
        Your situation*{" "}
        <textarea
          name="situation"
          value={form.situation}
          onChange={handleChange}
          placeholder="Describe your situation in 3–5 sentences..."
          rows={5}
          required
        />
      </label>

      <button type="submit" disabled={loading} className="primary-btn">
        {loading ? "Asking AI..." : "Get AI Guidance"}
      </button>
    </form>
  );
};

export default QueryForm;
