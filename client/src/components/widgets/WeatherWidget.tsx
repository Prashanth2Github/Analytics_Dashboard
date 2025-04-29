import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CloudSun,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWeatherData, selectWeather } from "@/store/slices/weatherSlice";
import { WidgetWrapper } from "./WidgetWrapper";
import { LineChart } from "@/components/ui/chart";

export function WeatherWidget() {
  const [city, setCity] = useState("");
  const [searchError, setSearchError] = useState("");
  const dispatch = useDispatch();
  const { current, forecast, loading, error, location } = useSelector(selectWeather);

  useEffect(() => {
    // Get user's location by default if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(fetchWeatherData({ lat: latitude, lon: longitude }));
        },
        () => {
          // If geolocation is denied, use default city
          dispatch(fetchWeatherData({ city: "New York" }));
        }
      );
    } else {
      dispatch(fetchWeatherData({ city: "New York" }));
    }
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim()) {
      setSearchError("Please enter a city name");
      return;
    }
    
    setSearchError("");
    dispatch(fetchWeatherData({ city }));
  };

  const handleRefresh = () => {
    if (location) {
      dispatch(fetchWeatherData({ city: location }));
    }
  };

  // Map weather condition to appropriate icon
  const getWeatherIcon = (condition: string, large = false) => {
    const iconSize = large ? "h-12 w-12" : "h-6 w-6";
    
    switch ((condition || "").toLowerCase()) {
      case "clear":
        return <Sun className={`${iconSize} text-yellow-500`} />;
      case "clouds":
      case "cloudy":
        return <Cloud className={`${iconSize} text-blue-500`} />;
      case "rain":
      case "drizzle":
        return <CloudRain className={`${iconSize} text-blue-500`} />;
      case "snow":
        return <CloudSnow className={`${iconSize} text-blue-300`} />;
      case "fog":
      case "mist":
        return <CloudFog className={`${iconSize} text-gray-500`} />;
      case "thunderstorm":
        return <CloudLightning className={`${iconSize} text-purple-500`} />;
      default:
        return <CloudSun className={`${iconSize} text-blue-500`} />;
    }
  };

  // Format chart data
  const chartData = forecast?.map((day) => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    temp: day.temperature,
  }));

  return (
    <WidgetWrapper title="Weather" widgetId="weather" onRefresh={handleRefresh}>
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search location..."
            className="pl-9 pr-4"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          {searchError && <p className="text-xs text-red-500 mt-1">{searchError}</p>}
        </form>

        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-2">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {current?.temperature}°F
                </div>
                <div className="text-md text-gray-500 dark:text-gray-400 mt-1">
                  {current?.description}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{location}</div>
              </div>
              <div className="text-5xl text-blue-500 dark:text-blue-400">
                {getWeatherIcon(current?.condition || "", true)}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
              {forecast?.slice(0, 4).map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="font-medium mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg mb-1">{getWeatherIcon(day.condition)}</div>
                  <div>{day.temperature}°F</div>
                </div>
              ))}
            </div>

            <div className="mt-6 h-[200px]">
              {chartData && chartData.length > 0 && (
                <LineChart
                  data={chartData}
                  categories={["temp"]}
                  colors={["blue"]}
                  yAxisWidth={40}
                  showLegend={false}
                  showXAxis
                  showYAxis
                  showGridLines
                  startEndOnly
                  className="h-full"
                />
              )}
            </div>
          </>
        )}
      </div>
    </WidgetWrapper>
  );
}

export default WeatherWidget;
