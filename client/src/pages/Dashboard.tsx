import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import NewsWidget from "@/components/widgets/NewsWidget";
import FinanceWidget from "@/components/widgets/FinanceWidget";
import SummaryStatsWidget from "@/components/widgets/SummaryStatsWidget";
import UserActivityWidget from "@/components/widgets/UserActivityWidget";
import { RootState } from "@/store";
import { initWidgets } from "@/store/slices/widgetsSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { widgetsOrder } = useSelector((state: RootState) => state.widgets);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize widgets if not already done
    dispatch(initWidgets());
  }, [dispatch]);

  // Define the available widgets with their components
  const widgets: Record<string, JSX.Element> = {
    weather: <WeatherWidget />,
    news: <NewsWidget />,
    finance: <FinanceWidget />,
    summary: <SummaryStatsWidget />,
    activity: <UserActivityWidget />,
  };

  // Render widgets in their correct order
  const renderWidgets = () => {
    return widgetsOrder.map((widgetId) => {
      return widgets[widgetId] || null;
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's your analytics overview for today.
        </p>
      </div>

      {/* Only render widgets client-side to avoid hydration issues */}
      {isClient && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {renderWidgets()}
        </div>
      )}
    </DashboardLayout>
  );
}
