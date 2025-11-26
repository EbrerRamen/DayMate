import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Home from "./components/Home";
import PlanHistory from "./components/PlanHistory";
import Dashboard from "./components/dashboard/Dashboard";
import LoginView from "./components/views/LoginView";
import RegisterView from "./components/views/RegisterView";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { useLocationData } from "./hooks/useLocationData";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const GUEST_LOCATIONS_KEY = "daymate_guest_locations";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [currentView, setCurrentView] = useState("home");
  const [savedLocations, setSavedLocations] = useState([]);
  const [guestLocations, setGuestLocations] = useState(() => {
    try {
      const raw = localStorage.getItem(GUEST_LOCATIONS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.map((loc) => ({ ...loc, source: "guest" }));
    } catch (error) {
      console.error("Failed to parse guest locations", error);
      return [];
    }
  });
  const [activeLocationId, setActiveLocationId] = useState(null);
  const [plansByLocation, setPlansByLocation] = useState({});
  const [planLoading, setPlanLoading] = useState(false);

  const { coords, error: geoError } = useCurrentLocation();

  const locations = useMemo(() => {
    const list = [];
    if (coords) {
      list.push({
        id: "current",
        label: "Current Location",
        lat: coords.lat,
        lon: coords.lon,
        source: "current",
      });
    }
    const userLocations = token ? savedLocations : guestLocations;
    return [...list, ...userLocations];
  }, [coords, savedLocations, guestLocations, token]);

  const activeLocation = locations.find((loc) => loc.id === activeLocationId) || null;
  const { weather, news } = useLocationData(API_BASE, activeLocation);
  const canSaveLocations = Boolean(token);
  const plan = activeLocation ? plansByLocation[activeLocation.id] : null;

  useEffect(() => {
    if (geoError) {
      alert(geoError);
    }
  }, [geoError]);

  useEffect(() => {
    if (token && currentView === "login") {
      setCurrentView("main");
    }
  }, [token, currentView]);

  useEffect(() => {
    if (!locations.length) return;
    setActiveLocationId((prev) => {
      if (prev && locations.some((loc) => loc.id === prev)) {
        return prev;
      }
      return locations[0].id;
    });
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(
      GUEST_LOCATIONS_KEY,
      JSON.stringify(guestLocations.map(({ id, label, lat, lon }) => ({ id, label, lat, lon })))
    );
  }, [guestLocations]);

  useEffect(() => {
    const fetchSavedLocations = async () => {
      if (!token) {
        setSavedLocations([]);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/api/locations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedLocations(res.data.map((loc) => ({ ...loc, source: "saved" })));
      } catch (error) {
        console.error(error);
        alert("Unable to load saved locations.");
      }
    };
    fetchSavedLocations();
  }, [token]);

  const onGeneratePlan = async () => {
    if (!activeLocation) return alert("Select or add a location first.");
    setPlanLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/plan`,
        {
          lat: activeLocation.lat,
          lon: activeLocation.lon,
          location_name: activeLocation.label,
          preferences: { outdoors: true },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setPlansByLocation((prev) => ({
        ...prev,
        [activeLocation.id]: response.data,
      }));
    } catch (error) {
      console.error(error);
      alert("Error generating plan");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPlansByLocation({});
    setCurrentView("home");
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    setPlansByLocation({});
    setCurrentView("main");
  };

  const handleAddLocation = async ({ label, lat, lon }) => {
    if (token) {
      try {
        const res = await axios.post(
          `${API_BASE}/api/locations`,
          { label, lat, lon },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedLocations((prev) => [...prev, { ...res.data, source: "saved" }]);
        setActiveLocationId(res.data.id);
      } catch (error) {
        console.error(error);
        alert("Unable to save location.");
      }
    } else {
      const id = `guest-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
      const newLocation = { id, label, lat, lon, source: "guest" };
      setGuestLocations((prev) => [...prev, newLocation]);
      setActiveLocationId(id);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    const target = locations.find((loc) => loc.id === locationId);
    if (!target || target.source === "current") return;

    if (target.source === "saved") {
      try {
        await axios.delete(`${API_BASE}/api/locations/${locationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedLocations((prev) => prev.filter((loc) => loc.id !== locationId));
      } catch (error) {
        console.error(error);
        alert("Unable to delete location.");
        return;
      }
    } else {
      setGuestLocations((prev) => prev.filter((loc) => loc.id !== locationId));
    }

    setPlansByLocation((prev) => {
      const clone = { ...prev };
      delete clone[locationId];
      return clone;
    });

    if (activeLocationId === locationId) {
      setActiveLocationId(null);
    }
  };

  const goToHome = () => {
    setPlansByLocation({});
    setCurrentView("home");
  };
  const goToMain = () => setCurrentView("main");
  const goToGuestMode = goToMain;
  const goToLogin = () => {
    setPlansByLocation({});
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
      locations={locations}
      activeLocation={activeLocation}
      activeLocationId={activeLocationId}
      weather={weather}
      news={news}
      plan={plan}
      planLoading={planLoading}
      onGeneratePlan={onGeneratePlan}
      onLogout={handleLogout}
      onGuestMode={goToGuestMode}
      onLoginMode={goToLogin}
      onHome={goToHome}
      onHistory={goToHistory}
      onSelectLocation={setActiveLocationId}
      onAddLocation={handleAddLocation}
      onDeleteLocation={handleDeleteLocation}
      canSaveLocations={canSaveLocations}
    />
  );
}

export default App;
