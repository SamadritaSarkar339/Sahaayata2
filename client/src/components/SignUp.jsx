import React, { useState, useEffect } from "react";

const SignUp = ({ onSignUp }) => {
  const [form, setForm] = useState({ name: "", email: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("sahaayata_user");
    if (existing) {
      const user = JSON.parse(existing);
      setForm({ name: user.name || "", email: user.email || "" });
      setSaved(true);
      if (onSignUp) onSignUp(user);
    }
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      return alert("Please enter name and email.");
    }
    localStorage.setItem("sahaayata_user", JSON.stringify(form));
    setSaved(true);
    if (onSignUp) onSignUp(form);
    alert("Saved — you are signed up locally. (You can later connect this to backend)");
  };

  const handleClear = () => {
    localStorage.removeItem("sahaayata_user");
    setForm({ name: "", email: "" });
    setSaved(false);
    if (onSignUp) onSignUp(null);
  };

  return (
    <div className="signup-card">
      <h4>{saved ? "Signed up" : "Sign up"}</h4>
      <form onSubmit={handleSubmit} className="signup-form">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} type="email" />
        </label>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: ".5rem" }}>
          <button type="submit" className="primary-btn">{saved ? "Update" : "Sign Up"}</button>
          {saved && <button type="button" className="secondary-btn" onClick={handleClear}>Sign out</button>}
        </div>
      </form>
      <div className="muted" style={{ marginTop: ".5rem", fontSize: ".85rem" }}>
        Signing up here stores your name & email locally. To save to server later, connect this flow to a backend register endpoint.
      </div>
    </div>
  );
};

export default SignUp;
