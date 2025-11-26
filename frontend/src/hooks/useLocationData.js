import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export function useLocationData(apiBase, location) {
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    try {
      const [weatherRes, newsRes] = await Promise.all([
        axios.get(`${apiBase}/api/weather`, { params: { lat: location.lat, lon: location.lon } }),
        axios.get(`${apiBase}/api/news`, { params: { lat: location.lat, lon: location.lon } }),
      ]);
      setWeather(weatherRes.data);
      setNews(newsRes.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching weather/news.");
    } finally {
      setLoading(false);
    }
  }, [apiBase, location]);

  useEffect(() => {
    if (!location) {
      setWeather(null);
      setNews(null);
      return;
    }
    fetchData();
  }, [fetchData, location]);

  return { weather, news, loading, refresh: fetchData };
}

