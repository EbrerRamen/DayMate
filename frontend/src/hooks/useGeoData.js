import { useEffect, useState } from "react";
import axios from "axios";

export function useGeoData(apiBase) {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState(null);

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
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [weatherRes, newsRes] = await Promise.all([
          axios.get(`${apiBase}/api/weather`, { params: { lat: coords.lat, lon: coords.lon } }),
          axios.get(`${apiBase}/api/news`, { params: { lat: coords.lat, lon: coords.lon } }),
        ]);
        if (!cancelled) {
          setWeather(weatherRes.data);
          setNews(newsRes.data);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          alert("Error fetching weather/news.");
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [coords, apiBase]);

  return { coords, weather, news };
}

