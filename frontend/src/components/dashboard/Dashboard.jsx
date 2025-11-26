import Navbar from "../NavBar";
import HeroSection from "./HeroSection";
import WeatherCard from "./WeatherCard";
import NewsPanel from "./NewsPanel";
import PlanDetails from "./PlanDetails";
import LocationTabs from "../locations/LocationTabs";

const Dashboard = ({
  token,
  locations,
  activeLocation,
  activeLocationId,
  weather,
  news,
  plan,
  planLoading,
  onGeneratePlan,
  onLogout,
  onGuestMode,
  onLoginMode,
  onHome,
  onHistory,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  canSaveLocations,
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

    <LocationTabs
      locations={locations}
      activeLocationId={activeLocationId}
      onSelectLocation={onSelectLocation}
      onAddLocation={onAddLocation}
      onDeleteLocation={onDeleteLocation}
      canSave={canSaveLocations}
    />

    <HeroSection loading={planLoading} activeLocation={activeLocation} onGeneratePlan={onGeneratePlan} />

    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {weather && <WeatherCard weather={weather} />}
      {news?.articles && <NewsPanel articles={news.articles} />}
    </div>

    <PlanDetails plan={plan?.plan} />
  </div>
);

export default Dashboard;

