import React, { useEffect, useState } from "react";
import axios from "axios";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import PlanHistory from "./components/PlanHistory";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function App() {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [currentView, setCurrentView] = useState("home"); // "home", "login", "register", "guest"



  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported. Please enter location manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        console.error(err);
        alert("Could not get geolocation. Enable location or enter manually.");
      }
    );
  }, []);

  // Fetch weather and news
  useEffect(() => {
    if (!coords) return;
    const fetchData = async () => {
      try {
        const w = await axios.get(`${API_BASE}/api/weather`, { params: { lat: coords.lat, lon: coords.lon } });
        setWeather(w.data);

        const n = await axios.get(`${API_BASE}/api/news`, { params: { lat: coords.lat, lon: coords.lon } });
        setNews(n.data);
      } catch (e) {
        console.error(e);
        alert("Error fetching weather/news.");
      }
    };
    fetchData();
  }, [coords]);

  // Generate AI plan
const onGeneratePlan = async () => {
  if (!coords) return alert("No coords");
  setLoading(true);
  try {
    const r = await axios.post(
      `${API_BASE}/api/plan`,
      {
        lat: coords.lat,
        lon: coords.lon,
        location_name: "",
        preferences: { outdoors: true },
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    setPlan(r.data);
  } catch (e) {
    console.error(e);
    alert("Error generating plan");
  } finally {
    setLoading(false);
  }
};

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPlan(null);
    setCurrentView("home");
  };

  // Navigation handlers
  const goToHome = () => {
  setPlan(null);
  setCurrentView("home");
};
  const goToMain = () => setCurrentView("main"); 
  const goToGuestMode = goToMain;     
  const goToLogin = () => {
  setPlan(null);   
  setCurrentView("login");
};
  const goToRegister = () => setCurrentView("register");
  const goToHistory = () => setCurrentView("history");

  // Render based on currentView
  if (currentView === "home") {
    return <Home onGuestMode={goToGuestMode} onLoginMode={goToLogin} />;
  }

if (currentView === "history" && token) {
  return <PlanHistory token={token} onBack={goToMain} />;
}
  if (currentView === "login" && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white font-sans p-6 flex items-center justify-center">
        <div className="w-full max-w-md">

          <button
            onClick={goToHome}
            className="mb-4 text-indigo-300 hover:text-indigo-100 underline cursor-pointer"
          >
            ← Back to Home
          </button>

        <Login onLoginSuccess={(t) => {
          setToken(t);
          localStorage.setItem("token", t);
          setPlan(null);            
          setCurrentView("main");
        }} />

          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <button className="text-cyan-400 underline hover:text-cyan-200 transition cursor-pointer" onClick={goToRegister}>
              Register
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (currentView === "register" && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white font-sans p-6 flex items-center justify-center">
        <div className="w-full max-w-md">

          {/* Back to Home button */}
          <button
            onClick={goToHome}
            className="mb-4 text-indigo-300 hover:text-indigo-100 underline cursor-pointer"
          >
            ← Back to Home
          </button>

          <Register onRegisterSuccess={() => {
            setCurrentView("login");
          }} />

          <p className="mt-4 text-center">
            Already have an account?{" "}
            <button className="text-cyan-400 underline hover:text-cyan-200 transition cursor-pointer" onClick={goToLogin}>
              Login
            </button>
          </p>
          
        </div>
      </div>
    );
  }

  // Main logged-in / guest view
  if (currentView === "main") {

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white font-sans p-6">
      <Navbar
        token={token}
        onLogout={handleLogout}
        onGuestMode={goToGuestMode}
        onLoginMode={goToLogin}
        onHome={goToHome} 
        onHistory={goToHistory}
      />
      {/* Hero Section */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-2 drop-shadow-md">
          DayMate — <span className="text-cyan-400">Your AI Daily Planner</span>
        </h1>
        <p className="text-indigo-200 text-lg">Plan your day smarter with weather, news, and AI-powered suggestions.</p>
        <button
          onClick={onGeneratePlan}
          disabled={loading || !coords}
          className={`mt-6 px-8 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200 ${
            loading || !coords ? "bg-indigo-600/50 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 hover:scale-105 cursor-pointer"
          } text-white`}
        >
          {loading ? "Generating…" : "Generate Plan"}
        </button>
      </header>

      {/* Weather & News */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {weather && (
          <div className="p-6 h-[380px] rounded-3xl bg-gradient-to-br from-blue-900/60 to-indigo-900/40 
    backdrop-blur-lg border border-white/20 shadow-2xl flex flex-col">
            {/* Weather content here... same as before */}
                      {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-cyan-300 flex items-center gap-2">
              🌤 Weather
            </h2>
            <span className="text-white/70 text-sm">{weather.name}, {weather.sys.country}</span>
          </div>

          {/* Main Temperature */}
          <div className="flex items-center gap-6">
            {/* Icon */}
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-20 h-20"
            />
            {/* Temp & Description */}
            <div>
              <p className="text-5xl font-bold text-white">
                {Math.round(weather.main.temp)}°C
              </p>
              <p className="capitalize text-lg text-white/80 mt-1">
                {weather.weather[0].description}
              </p>
            </div>
          </div>

          {/* Info Badges */}
          <div className="mt-auto grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 px-3 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium text-sm">
              <span className="text-xs">🌡️ Feels</span>
              <span className="text-lg font-semibold">{Math.round(weather.main.feels_like)}°C</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium text-sm">
              <span className="text-xs">💧 Humidity</span>
              <span className="text-lg font-semibold">{weather.main.humidity}%</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium text-sm">
              <span className="text-xs">🌬️ Wind</span>
              <span className="text-lg font-semibold">{weather.wind.speed} m/s</span>
            </div>
          </div>
          </div>
        )}

{news?.articles && (
  <div className="p-6 h-[380px] rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex flex-col">
    <h2 className="text-2xl font-semibold text-cyan-300 mb-4">📰 Top News</h2>

    <ul
  className="
    space-y-4 text-indigo-100 
    overflow-y-auto pr-2
    scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent
    hover:scrollbar-thumb-cyan-400 hover:scrollbar-thumb-rounded-xl
    transition-all duration-300
  "
>
      {news.articles.slice(0, 5).map((a, idx) => (
        <li key={idx} className="bg-white/5 p-3 rounded-xl flex gap-3">
          
          {/* News Image */}
          <img
            src={a.urlToImage || "https://via.placeholder.com/80"}
            alt="news"
            className="w-20 h-20 object-cover rounded-lg"
          />

          {/* Title */}
          <a
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 transition font-medium"
          >
            {a.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}
      </div>

      {/* AI Plan */}
      {plan?.plan && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Plan content same as before */}
                    {plan.plan.summary && (
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">📋 Summary</h3>
              <p>{plan.plan.summary}</p>
            </div>
          )}

          {plan.plan.priority_actions?.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">🔥 Priority Actions</h3>
              <ul className="list-disc list-inside space-y-1">
                {plan.plan.priority_actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          {plan.plan.suggestions?.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">💡 Suggestions</h3>
              <ul className="list-disc list-inside space-y-1">
                {plan.plan.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {plan.plan.quick_tips?.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">⚡ Quick Tips</h3>
              <ul className="list-disc list-inside space-y-1">
                {plan.plan.quick_tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          {plan.plan.rationale && (
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">🧭 Rationale</h3>
              <p>{plan.plan.rationale}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
  }
}
export default App;
