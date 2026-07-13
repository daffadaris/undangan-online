"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/admin.css";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        const data = await res.json();
        setError(data.error || "Password salah");
      }
    } catch (e) {
      console.error(e);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1
          className="admin-title"
          style={{ textAlign: "center", marginBottom: "30px", fontSize: "1.8rem" }}
        >
          Admin Login
        </h1>

        <form onSubmit={handleLogin}>
          <div className="admin-input-group">
            <label className="admin-input-label" htmlFor="password">
              Password Admin
            </label>
            <input
              type="password"
              id="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin..."
              required
            />
          </div>

          {error && (
            <p style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "15px", fontWeight: "500" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-btn"
            style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <p style={{
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--admin-text-sub)",
          marginTop: "25px"
        }}>

        </p>
      </div>
    </div>
  );
}
