import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function PlanHistory({ token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/api/plan/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data.plans);
      } catch (e) {
        console.error("Error fetching history:", e);
        alert("Failed to fetch plan history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) return <p className="text-center text-white mt-8">Loading history…</p>;
  if (!history.length) return <p className="text-center text-white mt-8">No saved plans yet.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-cyan-300 mb-4 text-center">🗂️ Your Daily Plan History</h2>

      {history.map((h) => (
        <div
          key={h.id}
          className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transition-all"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-semibold text-lg text-cyan-200">{new Date(h.created_at).toLocaleString()}</p>
              <p className="text-sm text-white/70">{h.location_name}</p>
            </div>
            <button
              onClick={() =>
                setExpandedPlanId(expandedPlanId === h.id ? null : h.id)
              }
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {expandedPlanId === h.id ? "Hide Details" : "View Details"}
            </button>
          </div>

          {expandedPlanId === h.id && (
            <div className="mt-4 space-y-4 text-white/90">
              {h.plan.summary && (
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-1">📋 Summary</h3>
                  <p>{h.plan.summary}</p>
                </div>
              )}

              {h.plan.priority_actions?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-1">🔥 Priority Actions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {h.plan.priority_actions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}

              {h.plan.suggestions?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-1">💡 Suggestions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {h.plan.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {h.plan.quick_tips?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-1">⚡ Quick Tips</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {h.plan.quick_tips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}

              {h.plan.rationale && (
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-1">🧭 Rationale</h3>
                  <p>{h.plan.rationale}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
