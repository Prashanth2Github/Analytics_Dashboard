import { useState } from "react";
import { BarChart } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WidgetWrapper from "./WidgetWrapper";

export function UserActivityWidget() {
  const [timeRange, setTimeRange] = useState("7d");

  // This data would come from an API in a real application
  const activityData = {
    "7d": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [1500, 2200, 1800, 2400, 2100, 1300, 1900],
      dailyActiveUsers: 2542,
      dailyChange: 7.2,
      weeklyActiveUsers: 10854,
      weeklyChange: 5.3,
      monthlyActiveUsers: 42384,
      monthlyChange: 12.8
    },
    "30d": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      values: [8500, 9200, 10800, 12400],
      dailyActiveUsers: 3245,
      dailyChange: 10.5,
      weeklyActiveUsers: 14586,
      weeklyChange: 8.2,
      monthlyActiveUsers: 58472,
      monthlyChange: 15.3
    },
    "90d": {
      labels: ["Month 1", "Month 2", "Month 3"],
      values: [35000, 42000, 48000],
      dailyActiveUsers: 4125,
      dailyChange: 15.8,
      weeklyActiveUsers: 18956,
      weeklyChange: 12.7,
      monthlyActiveUsers: 75284,
      monthlyChange: 18.6
    }
  };

  const currentData = activityData[timeRange as keyof typeof activityData];
  
  const chartData = currentData.labels.map((label, index) => ({
    name: label,
    value: currentData.values[index]
  }));

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  return (
    <WidgetWrapper title="User Activity" widgetId="activity" colSpan="md:col-span-2">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Select defaultValue="7d" onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-64">
          <BarChart
            data={chartData}
            categories={["value"]}
            colors={["indigo"]}
            yAxisWidth={48}
            showLegend={false}
            showXAxis
            showYAxis
            showGridLines
            className="h-full"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Active Users</div>
            <div className="mt-1 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {currentData.dailyActiveUsers.toLocaleString()}
              </div>
              <div className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                <svg
                  className="inline h-3 w-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  ></path>
                </svg>
                {currentData.dailyChange}%
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly Active Users</div>
            <div className="mt-1 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {currentData.weeklyActiveUsers.toLocaleString()}
              </div>
              <div className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                <svg
                  className="inline h-3 w-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  ></path>
                </svg>
                {currentData.weeklyChange}%
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Active Users</div>
            <div className="mt-1 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {currentData.monthlyActiveUsers.toLocaleString()}
              </div>
              <div className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">
                <svg
                  className="inline h-3 w-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  ></path>
                </svg>
                {currentData.monthlyChange}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </WidgetWrapper>
  );
}

export default UserActivityWidget;
