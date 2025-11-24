import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Register({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/register`, { email, password, full_name: fullName });
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
    <form onSubmit={handleRegister} className="max-w-md mx-auto p-6 bg-white/10 rounded-xl shadow-lg space-y-4">
      <h2 className="text-2xl font-semibold text-cyan-300 text-center">Register</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70"
      />
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
        {loading ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
