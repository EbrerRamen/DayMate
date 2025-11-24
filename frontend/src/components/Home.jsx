// frontend/src/components/Home.jsx
import React from "react";

function Home({ onGuestMode, onLoginMode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white font-sans flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-6 text-center drop-shadow-md">
        Welcome to DayMate
      </h1>
      <p className="text-indigo-200 text-lg mb-12 text-center">
        Plan your day smarter with AI, weather updates, and news.
      </p>

      <div className="flex flex-col gap-6 w-full max-w-xs">
        <button
          onClick={onGuestMode}
          className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 font-semibold shadow-lg transition-all duration-200"
        >
          Continue as Guest
        </button>

        <button
          onClick={onLoginMode}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-lg transition-all duration-200"
        >
          Login / Register
        </button>
      </div>
    </div>
  );
}

export default Home;
