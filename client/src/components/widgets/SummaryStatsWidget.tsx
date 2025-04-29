import { useEffect } from "react";
import { 
  Eye, 
  Users, 
  Clock, 
  BarChart2, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import WidgetWrapper from "./WidgetWrapper";
import { formatCompactNumber } from "@/lib/utils";

type StatItemProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  changeValue: number;
  changeText: string;
};

function StatItem({ title, value, icon, changeValue, changeText }: StatItemProps) {
  const isPositive = changeValue >= 0;
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 p-3 rounded-md">
          {icon}
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">{value}</div>
        </div>
      </div>
      <div className={`mt-2 text-xs font-medium flex items-center ${
        isPositive 
          ? "text-green-600 dark:text-green-400" 
          : "text-red-600 dark:text-red-400"
      }`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3 mr-1" />
        ) : (
          <TrendingDown className="h-3 w-3 mr-1" />
        )}
        {Math.abs(changeValue).toFixed(1)}% {changeText}
      </div>
    </div>
  );
}

export function SummaryStatsWidget() {
  // In a real app, this data would come from an API or state
  const statsData = [
    {
      title: "Page Views",
      value: formatCompactNumber(12584),
      icon: <Eye className="h-5 w-5 text-primary-600 dark:text-primary-400" />,
      changeValue: 12.5,
      changeText: "from last week"
    },
    {
      title: "New Users",
      value: formatCompactNumber(854),
      icon: <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      changeValue: 5.7,
      changeText: "from last week"
    },
    {
      title: "Avg. Time",
      value: "3m 42s",
      icon: <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      changeValue: -1.8,
      changeText: "from last week"
    },
    {
      title: "Bounce Rate",
      value: "32.4%",
      icon: <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-400" />,
      changeValue: -3.2, // Negative is good for bounce rate
      changeText: "from last week"
    }
  ];

  return (
    <WidgetWrapper title="Dashboard Summary" widgetId="summary">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statsData.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </div>
    </WidgetWrapper>
  );
}

export default SummaryStatsWidget;
