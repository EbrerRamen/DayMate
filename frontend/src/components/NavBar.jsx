import React from "react";

export default function Navbar({ token, onLogout, onGuestMode, onLoginMode, onHome }) {
  return (
    <nav className="flex justify-between items-center p-4 max-w-6xl mx-auto">
      <h1 
        onClick={onHome}
        className="text-2xl font-bold text-cyan-400 cursor-pointer"
      >
        DayMate
      </h1>

      <div className="space-x-4">
        {!token ? (
          <>
            <button
              onClick={onGuestMode}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
            >
              Continue as Guest
            </button>

            <button
              onClick={onLoginMode}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 transition"
            >
              Login
            </button>
          </>
        ) : (
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
