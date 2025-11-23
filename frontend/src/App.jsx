import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function App() {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!coords) return;
    const fetchData = async () => {
      try {
        const w = await axios.get(`${API_BASE}/api/weather`, { params: { lat: coords.lat, lon: coords.lon } });
        setWeather(w.data);
        const n = await axios.get(`${API_BASE}/api/news`, { params: { location: "Dhaka" } });
        setNews(n.data);
      } catch (e) {
        console.error(e);
        alert("Error fetching weather/news.");
      }
    };
    fetchData();
  }, [coords]);

  const onGeneratePlan = async () => {
    if (!coords) return alert("No coords");
    setLoading(true);
    try {
      const r = await axios.post(`${API_BASE}/api/plan`, {
        lat: coords.lat,
        lon: coords.lon,
        location_name: "Dhaka",
        preferences: { outdoors: true },
      });
      setPlan(r.data);
    } catch (e) {
      console.error(e);
      alert("Error generating plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white font-sans p-6">
      
      {/* Hero */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-2 drop-shadow-md">
          DayMate — <span className="text-cyan-400">Your AI Daily Planner</span>
        </h1>
        <p className="text-indigo-200 text-lg">Plan your day smarter with weather, news, and AI-powered suggestions.</p>
        <button
          onClick={onGeneratePlan}
          disabled={loading || !coords}
          className={`mt-6 px-8 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200
            ${loading || !coords 
              ? "bg-indigo-600/50 cursor-not-allowed" 
              : "bg-cyan-500 hover:bg-cyan-400 hover:scale-105"} text-white`}
        >
          {loading ? "Generating…" : "Generate Plan"}
        </button>
      </header>

      {/* Weather & News */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
{weather && (
  <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
    <h2 className="text-2xl font-semibold text-cyan-300 mb-2">🌤 Weather</h2>
    <p className="text-xl font-medium capitalize">{weather.weather[0].description}</p>
    <p className="text-4xl font-bold mt-1">
      {Math.round(weather.main.temp)}°C
    </p>
    <div className="mt-2 text-indigo-100 space-y-1">
      <p>Feels like: {Math.round(weather.main.feels_like)}°C</p>
      <p>Humidity: {weather.main.humidity}%</p>
      <p>Wind: {weather.wind.speed} km/s</p>
    </div>
  </div>
)}

        {news?.articles && (
          <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <h2 className="text-2xl font-semibold text-cyan-300 mb-2">📰 Top News</h2>
            <ul className="space-y-2 text-indigo-100">
              {news.articles.slice(0, 5).map((a, idx) => (
                <li key={idx}>
                  <a href={a.url} target="_blank" rel="noreferrer" className="hover:text-cyan-400 hover:underline transition">
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

export default App;
