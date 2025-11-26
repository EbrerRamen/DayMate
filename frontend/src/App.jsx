import React, { useEffect, useState } from "react";
import axios from "axios";
import Home from "./components/Home";
import PlanHistory from "./components/PlanHistory";
import Dashboard from "./components/dashboard/Dashboard";
import LoginView from "./components/views/LoginView";
import RegisterView from "./components/views/RegisterView";
import { useGeoData } from "./hooks/useGeoData";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function App() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [currentView, setCurrentView] = useState("home");

  const { coords, weather, news } = useGeoData(API_BASE);

  useEffect(() => {
    if (token && currentView === "login") {
      setCurrentView("main");
    }
  }, [token, currentView]);

  const onGeneratePlan = async () => {
    if (!coords) return alert("No coords");
    setLoading(true);
    try {
      const response = await axios.post(
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
      setPlan(response.data);
    } catch (error) {
      console.error(error);
      alert("Error generating plan");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPlan(null);
    setCurrentView("home");
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    setPlan(null);
    setCurrentView("main");
  };

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

  if (currentView === "home") {
    return <Home onGuestMode={goToGuestMode} onLoginMode={goToLogin} />;
  }

  if (currentView === "history" && token) {
    return <PlanHistory token={token} onBack={goToMain} />;
  }

  if (currentView === "login") {
    if (token) return null;
    return <LoginView onBack={goToHome} onLoginSuccess={handleLoginSuccess} onNavigateToRegister={goToRegister} />;
  }

  if (currentView === "register") {
    if (token) return null;
    return <RegisterView onBack={goToHome} onRegisterSuccess={() => setCurrentView("login")} onNavigateToLogin={goToLogin} />;
  }

  return (
    <Dashboard
      token={token}
      coords={coords}
      weather={weather}
      news={news}
      plan={plan}
      loading={loading}
      onGeneratePlan={onGeneratePlan}
      onLogout={handleLogout}
      onGuestMode={goToGuestMode}
      onLoginMode={goToLogin}
      onHome={goToHome}
      onHistory={goToHistory}
    />
  );
}

export default App;
