"use client";

import { Lock } from "lucide-react";
import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Checking password...");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (response.ok) {
      window.location.href = "/admin";
      return;
    }

    setMessage("Password did not match.");
  }

  return (
    <form className="admin-card" onSubmit={submit}>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      <div className="admin-actions">
        <button className="button primary" type="submit">
          <Lock size={17} /> Sign in
        </button>
      </div>
      {message ? <p className="message">{message}</p> : null}
    </form>
  );
}
