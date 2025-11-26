import { useMemo, useState } from "react";

const typeStyles = {
  current: "bg-cyan-600/80 text-white",
  saved: "bg-emerald-600/80 text-white",
  guest: "bg-indigo-600/80 text-white",
};

const sourceLabels = {
  current: "Current",
  saved: "Saved",
  guest: "Guest",
};

const LocationTabs = ({
  locations,
  activeLocationId,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  canSave,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({ label: "", lat: "", lon: "" });

  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      const weight = { current: 0, saved: 1, guest: 2 };
      return weight[a.source] - weight[b.source];
    });
  }, [locations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.lat || !formState.lon) return alert("Latitude and longitude are required.");
    const label = formState.label.trim() || `Location ${locations.length + 1}`;
    onAddLocation({
      label,
      lat: parseFloat(formState.lat),
      lon: parseFloat(formState.lon),
    });
    setFormState({ label: "", lat: "", lon: "" });
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex flex-wrap gap-3 items-center">
        {sortedLocations.map((loc) => (
          <div
            key={loc.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${
              loc.id === activeLocationId ? "border-cyan-400" : "border-white/20"
            } bg-white/10`}
          >
            <button
              onClick={() => onSelectLocation(loc.id)}
              className="text-sm font-semibold text-white whitespace-nowrap"
            >
              {loc.label}
            </button>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyles[loc.source] || "bg-indigo-600/80"}`}>
              {sourceLabels[loc.source] || loc.source}
            </span>
            {loc.source !== "current" && (
              <button
                onClick={() => onDeleteLocation(loc.id)}
                className="text-white/60 hover:text-red-300 transition text-xs"
                title="Remove location"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="px-4 py-2 rounded-2xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-white transition"
        >
          {showForm ? "Cancel" : "+ Add Location"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm text-white/80">
              Label
              <input
                type="text"
                value={formState.label}
                onChange={(e) => setFormState((prev) => ({ ...prev, label: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white"
              />
            </label>
            <label className="text-sm text-white/80">
              Latitude
              <input
                type="number"
                step="0.000001"
                value={formState.lat}
                onChange={(e) => setFormState((prev) => ({ ...prev, lat: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white"
                required
              />
            </label>
            <label className="text-sm text-white/80">
              Longitude
              <input
                type="number"
                step="0.000001"
                value={formState.lon}
                onChange={(e) => setFormState((prev) => ({ ...prev, lon: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-white"
                required
              />
            </label>
          </div>
          <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs text-white/60">
              {canSave ? "Locations will sync with your account." : "Guest mode: locations are stored only on this browser."}
            </p>
            <button
              type="submit"
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition"
            >
              Save Location
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LocationTabs;

