import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Login({ onLoginSuccess, goToRegister }) {
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
    <form
      onSubmit={handleLogin}
      className="w-full p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl space-y-6"
    >
      <h2 className="text-2xl font-bold text-cyan-300 text-center">Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-white shadow-md transform transition-all duration-200 cursor-pointer ${
          loading ? "bg-cyan-600/50 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 hover:scale-105"
        }`}
      >
        {loading ? "Logging in…" : "Login"}
      </button>

    </form>
  );
}
