const HeroSection = ({ loading, coords, onGeneratePlan }) => (
  <header className="max-w-4xl mx-auto text-center mb-12">
    <h1 className="text-5xl font-bold mb-2 drop-shadow-md">
      DayMate — <span className="text-cyan-400">Your AI Daily Planner</span>
    </h1>
    <p className="text-indigo-200 text-lg">Plan your day smarter with weather, news, and AI-powered suggestions.</p>
    <button
      onClick={onGeneratePlan}
      disabled={loading || !coords}
      className={`mt-6 px-8 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200 ${
        loading || !coords ? "bg-indigo-600/50 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400 hover:scale-105 cursor-pointer"
      } text-white`}
    >
      {loading ? "Generating…" : "Generate Plan"}
    </button>
  </header>
);

export default HeroSection;

