import Navbar from "../Navbar";
import HeroSection from "./HeroSection";
import WeatherCard from "./WeatherCard";
import NewsPanel from "./NewsPanel";
import PlanDetails from "./PlanDetails";

const Dashboard = ({
  token,
  coords,
  weather,
  news,
  plan,
  loading,
  onGeneratePlan,
  onLogout,
  onGuestMode,
  onLoginMode,
  onHome,
  onHistory,
}) => (
  <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white font-sans p-6">
    <Navbar
      token={token}
      onLogout={onLogout}
      onGuestMode={onGuestMode}
      onLoginMode={onLoginMode}
      onHome={onHome}
      onHistory={onHistory}
    />
    <HeroSection loading={loading} coords={coords} onGeneratePlan={onGeneratePlan} />

    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {weather && <WeatherCard weather={weather} />}
      {news?.articles && <NewsPanel articles={news.articles} />}
    </div>

    <PlanDetails plan={plan?.plan} />
  </div>
);

export default Dashboard;

