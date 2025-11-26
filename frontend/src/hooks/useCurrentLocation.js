import { useEffect, useState } from "react";

export function useCurrentLocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported. Please enter location manually.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Could not get geolocation. Enable location or enter manually.");
        setLoading(false);
      }
    );
  }, []);

  return { coords, error, loading };
}

