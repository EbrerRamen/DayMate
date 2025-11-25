import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function PlanHistory({ token, onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/plan/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlans(res.data.plans);
      } catch (e) {
        console.error(e);
        alert("Error fetching plan history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);



  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white p-6">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Your Plan History</h1>

{loading ? (
  <div className="space-y-4">
    {/* Skeleton cards */}
    {Array(3).fill(0).map((_, i) => (
      <div
        key={i}
        className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md h-40 animate-pulse"
      ></div>
    ))}
  </div>
) : plans.length === 0 ? (
  <p>No plans found.</p>
) : (
  <div className="space-y-6">
    {plans.map((p) => (
      <div
        key={p.id}
        className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md"
      >
        <p className="text-sm text-white/70 mb-2">
          {new Date(p.created_at).toLocaleString()} — {p.location_name}
        </p>

        {p.plan.summary && (
          <div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-1">📋 Summary</h3>
            <p>{p.plan.summary}</p>
          </div>
        )}

        {p.plan.priority_actions?.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-1">🔥 Priority Actions</h3>
            <ul className="list-disc list-inside space-y-1">
              {p.plan.priority_actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {p.plan.suggestions?.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-1">💡 Suggestions</h3>
            <ul className="list-disc list-inside space-y-1">
              {p.plan.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {p.plan.quick_tips?.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-1">⚡ Quick Tips</h3>
            <ul className="list-disc list-inside space-y-1">
              {p.plan.quick_tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {p.plan.rationale && (
          <div>
            <h3 className="text-xl font-semibold text-cyan-300 mb-1">🧭 Rationale</h3>
            <p>{p.plan.rationale}</p>
          </div>
        )}
      </div>
    ))}
  </div>
)}

    </div>
  );
}
