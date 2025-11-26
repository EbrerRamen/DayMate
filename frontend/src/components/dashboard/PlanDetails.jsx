const Section = ({ title, children }) => (
  <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
    <h3 className="text-xl font-semibold text-cyan-300 mb-2">{title}</h3>
    {children}
  </div>
);

const PlanDetails = ({ plan }) => {
  if (!plan) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {plan.summary && (
        <Section title="📋 Summary">
          <p>{plan.summary}</p>
        </Section>
      )}

      {plan.priority_actions?.length > 0 && (
        <Section title="🔥 Priority Actions">
          <ul className="list-disc list-inside space-y-1">
            {plan.priority_actions.map((action, idx) => (
              <li key={idx}>{action}</li>
            ))}
          </ul>
        </Section>
      )}

      {plan.suggestions?.length > 0 && (
        <Section title="💡 Suggestions">
          <ul className="list-disc list-inside space-y-1">
            {plan.suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </Section>
      )}

      {plan.quick_tips?.length > 0 && (
        <Section title="⚡ Quick Tips">
          <ul className="list-disc list-inside space-y-1">
            {plan.quick_tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </Section>
      )}

      {plan.rationale && (
        <Section title="🧭 Rationale">
          <p>{plan.rationale}</p>
        </Section>
      )}
    </div>
  );
};

export default PlanDetails;

