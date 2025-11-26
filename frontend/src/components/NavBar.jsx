import React from "react";

export default function Navbar({ token, onLogout, onGuestMode, onLoginMode, onHome, onHistory }) {
  return (
    <nav className="flex justify-between items-center p-4 max-w-6xl mx-auto">
      <button
        onClick={onHome}
        className="text-2xl font-bold text-cyan-400 cursor-pointer hover:text-cyan-300 transition"
      >
        DayMate
      </button>

      <div className="flex items-center gap-3">
        {!token ? (
          <button
            onClick={onLoginMode}
            className="px-5 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition cursor-pointer"
          >
            Log in
          </button>
        ) : (
          <>
            <button
              onClick={onHistory}
              className="px-4 py-2 rounded-full border border-white/25 text-sm text-white/90 hover:bg-white/10 transition cursor-pointer"
            >
              History
            </button>
            <button
              onClick={onLogout}
              className="px-5 py-2 rounded-full bg-red-500/90 hover:bg-red-400 text-sm font-semibold text-white shadow-md shadow-red-500/30 transition cursor-pointer"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
