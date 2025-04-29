import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LineChart } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RootState } from "@/store";
import { 
  fetchStockData, 
  searchStocks, 
  selectFinance,
  toggleTimeRange,
} from "@/store/slices/financeSlice";
// Import icons from available icons in react-icons
import { BiLogoApple, BiLogoMicrosoft, BiLogoAmazon, BiLogoGoogle } from "react-icons/bi";
import { TbBrandTesla } from "react-icons/tb";
import WidgetWrapper from "./WidgetWrapper";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { StockData } from "@/types";

export function FinanceWidget() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [timeRange, setTimeRange] = useState("1M");
  const dispatch = useDispatch();
  const { 
    stockData, 
    stockList, 
    searchResults, 
    historicalData, 
    loading, 
    error 
  } = useSelector(selectFinance);

  useEffect(() => {
    // Fetch initial stock data for popular stocks
    dispatch(fetchStockData({ symbol: "AAPL" }));
    dispatch(fetchStockData({ symbol: "MSFT" }));
    dispatch(fetchStockData({ symbol: "AMZN" }));
    dispatch(fetchStockData({ symbol: "GOOGL" }));
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 1) {
      dispatch(searchStocks({ query: value }));
    }
  };

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    dispatch(fetchStockData({ symbol }));
    dispatch(toggleTimeRange({ symbol, timeRange }));
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    dispatch(toggleTimeRange({ symbol: selectedStock, timeRange: range }));
  };

  const handleRefresh = () => {
    dispatch(fetchStockData({ symbol: selectedStock }));
  };

  // Map company symbols to icons
  const getStockIcon = (symbol: string) => {
    switch (symbol) {
      case "AAPL":
        return <BiLogoApple className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "MSFT":
        return <BiLogoMicrosoft className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "AMZN":
        return <BiLogoAmazon className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "GOOGL":
        return <BiLogoGoogle className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "TSLA":
        return <TbBrandTesla className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <div className="h-5 w-5 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center text-xs text-blue-600 dark:text-blue-400 font-bold">
          {symbol.charAt(0)}
        </div>;
    }
  };

  // Format chart data
  const chartData = historicalData[selectedStock]?.map((dataPoint) => ({
    date: new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: dataPoint.price,
  })) || [];

  return (
    <WidgetWrapper title="Stock Market" widgetId="finance" onRefresh={handleRefresh}>
      <div className="space-y-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for stocks..."
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={handleSearch}
          />
          
          {searchQuery.length > 1 && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSearchQuery("");
                    handleStockSelect(result.symbol);
                  }}
                >
                  <div className="font-medium">{result.symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{result.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {loading && !stockData[selectedStock] ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
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
            <div className="mb-2">
              <Tabs defaultValue="1M" onValueChange={handleTimeRangeChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="1D">1D</TabsTrigger>
                  <TabsTrigger value="1W">1W</TabsTrigger>
                  <TabsTrigger value="1M">1M</TabsTrigger>
                  <TabsTrigger value="1Y">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="mb-4 h-[200px]">
              {chartData.length > 0 ? (
                <LineChart
                  data={chartData}
                  categories={["price"]}
                  colors={["blue"]}
                  yAxisWidth={65}
                  showLegend={false}
                  showXAxis
                  showYAxis
                  showGridLines
                  startEndOnly
                  valueFormatter={(value) => formatCurrency(value)}
                  className="h-full"
                />
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">No historical data available</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {Object.values(stockData)
                .slice(0, 3)
                .map((stock, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 cursor-pointer"
                    onClick={() => handleStockSelect(stock.symbol)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-2">
                        {getStockIcon(stock.symbol)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {stock.companyName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(stock.price)}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          stock.change >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              
              <div className="pt-2">
                <Button 
                  variant="ghost" 
                  className="w-full text-primary hover:text-primary/80"
                >
                  View All Stocks
                  <span className="ml-1">→</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </WidgetWrapper>
  );
}

export default FinanceWidget;
