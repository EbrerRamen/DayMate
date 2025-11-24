import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      onLoginSuccess(token);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-6 bg-white/10 rounded-xl shadow-lg space-y-4">
      <h2 className="text-2xl font-semibold text-cyan-300 text-center">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70"
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold ${loading ? "bg-cyan-600/50" : "bg-cyan-500 hover:bg-cyan-400"}`}
      >
        {loading ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}
