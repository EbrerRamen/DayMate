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
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ lat, lon });
      },
      (err) => {
        console.error(err);
        alert("Could not get geolocation. Enter coords manually or enable location.");
      }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    const fetchData = async () => {
      try {
        const w = await axios.get(`${API_BASE}/api/weather`, {
          params: { lat: coords.lat, lon: coords.lon },
        });
        setWeather(w.data);
        const n = await axios.get(`${API_BASE}/api/news`, {
          params: { location: "Dhaka" }, // or reverse geocode to location name
        });
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
        location_name: "Dhaka", // ideally reverse geocode
        preferences: { outdoors: true }
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
    <div style={{ padding: 20, fontFamily: "Inter, system-ui" }}>
      <h1>DayMate — AI Daily Planner</h1>

      <div style={{ marginTop: 20 }}>
        <button onClick={onGeneratePlan} disabled={loading || !coords}>
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>

      {weather && (
        <section style={{ marginTop: 20 }}>
          <h2>Weather</h2>
          <div>Current: {weather.weather[0].description}, {weather.main.temp}°C</div>
        </section>
      )}

      {news && news.articles && (
        <section style={{ marginTop: 20 }}>
          <h2>Top news</h2>
          <ul>
            {news.articles.slice(0,5).map((a, idx) => (
              <li key={idx}><a href={a.url} target="_blank" rel="noreferrer">{a.title}</a></li>
            ))}
          </ul>
        </section>
      )}

      {plan && plan.plan && (
        <section style={{ marginTop: 20 }}>
          <h2>AI Plan</h2>

          {/* Summary */}
          {plan.plan.summary && (
            <p><strong>Summary:</strong> {plan.plan.summary}</p>
          )}

          {/* Priority Actions */}
          {plan.plan.priority_actions?.length > 0 && (
            <>
              <h3>Priority Actions</h3>
              <ul>
                {plan.plan.priority_actions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </>
          )}

          {/* Suggestions */}
          {plan.plan.suggestions?.length > 0 && (
            <>
              <h3>Suggestions</h3>
              <ul>
                {plan.plan.suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {/* Quick Tips */}
          {plan.plan.quick_tips?.length > 0 && (
            <>
              <h3>Quick Tips</h3>
              <ul>
                {plan.plan.quick_tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </>
          )}

          {/* Rationale */}
          {plan.plan.rationale && (
            <p><strong>Rationale:</strong> {plan.plan.rationale}</p>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
