import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Register({ onRegisterSuccess, goToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/register`, { full_name: fullName, email, password });
      alert("Registration successful! You can now log in.");
      onRegisterSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="w-full max-w-md mx-auto p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl space-y-6"
    >
      <h2 className="text-2xl font-bold text-cyan-300 text-center">Register</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
      />

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
        {loading ? "Registering…" : "Register"}
      </button>

    </form>
  );
}
