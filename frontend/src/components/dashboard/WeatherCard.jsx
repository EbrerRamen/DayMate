const formatLocalDateTime = (timestamp, timezoneOffset) => {
  const offsetSeconds = typeof timezoneOffset === "number" ? timezoneOffset : 0;
  const localDate = new Date((timestamp + offsetSeconds) * 1000);
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return formatter.format(localDate);
};

const WeatherCard = ({ weather }) => (
  <div className="p-6 h-[400px] rounded-3xl bg-gradient-to-br from-blue-900/60 to-indigo-900/40 backdrop-blur-lg border border-white/20 shadow-2xl flex flex-col">
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-semibold text-cyan-300 flex items-center gap-2">🌤 Weather</h2>
        <span className="text-white/70 text-sm">
          {weather.name}, {weather.sys.country}
        </span>
      </div>
      <p className="text-white/60 text-xs">
        {formatLocalDateTime(weather.dt, weather.timezone)} local time
      </p>
    </div>

    <div className="flex items-center gap-6 mt-4">
      <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].description} className="w-20 h-20" />
      <div>
        <p className="text-5xl font-bold text-white">{Math.round(weather.main.temp)}°C</p>
        <p className="capitalize text-lg text-white/80 mt-1">{weather.weather[0].description}</p>
      </div>
    </div>

    <div className="mt-auto grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center gap-1 px-3 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium text-sm">
        <span className="text-xs">🌡️ Feels</span>
        <span className="text-lg font-semibold">{Math.round(weather.main.feels_like)}°C</span>
      </div>
      <div className="flex flex-col items-center gap-1 px-3 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium text-sm">
        <span className="text-xs">💧 Humidity</span>
        <span className="text-lg font-semibold">{weather.main.humidity}%</span>
      </div>
      <div className="flex flex-col items-center gap-1 px-3 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium text-sm">
        <span className="text-xs">🌬️ Wind</span>
        <span className="text-lg font-semibold">{weather.wind.speed} m/s</span>
      </div>
    </div>
  </div>
);

export default WeatherCard;

