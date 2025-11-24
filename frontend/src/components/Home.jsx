// frontend/src/components/Home.jsx
import React from "react";
import { FaUser, FaRocket } from "react-icons/fa";

function Home({ onGuestMode, onLoginMode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-950 to-indigo-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
          Welcome to <span className="text-cyan-400">DayMate</span>
        </h1>
        <p className="text-indigo-200 text-lg md:text-xl mb-12 max-w-xl">
          Plan your day smarter with AI-powered daily plans, real-time weather updates, and trending news.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Guest Button */}
          <button
            onClick={onGuestMode}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-3xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-xl transform transition duration-300 hover:scale-105 cursor-pointer"
          >
            <FaRocket className="w-5 h-5" />
            Continue as Guest
          </button>

          {/* Login/Register Button */}
          <button
            onClick={onLoginMode}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xl transform transition duration-300 hover:scale-105 cursor-pointer"
          >
            <FaUser className="w-5 h-5" />
            Login / Register
          </button>
        </div>
      </div>

      {/* Footer wave */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-indigo-900 to-transparent"></div>
    </div>
  );
}

export default Home;
