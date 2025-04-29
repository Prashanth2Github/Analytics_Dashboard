import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  CloudSun,
  Newspaper,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

type SidebarItem = {
  title: string;
  icon: React.ReactNode;
  path: string;
};

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const [location] = useLocation();

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/",
    },
    {
      title: "Weather",
      icon: <CloudSun className="h-5 w-5" />,
      path: "/weather",
    },
    {
      title: "News",
      icon: <Newspaper className="h-5 w-5" />,
      path: "/news",
    },
    {
      title: "Finance",
      icon: <TrendingUp className="h-5 w-5" />,
      path: "/finance",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold dark:text-white">AnalyticsDash</h1>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-8 w-8 text-gray-500 dark:text-gray-400"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = location === item.path;
            return collapsed ? (
              <TooltipProvider key={item.path}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link href={item.path}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn("w-full justify-center p-2", isActive && "bg-primary")}
                        size="icon"
                      >
                        {item.icon}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn("w-full justify-start", isActive && "bg-primary")}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="my-2" />

      <div
        className={cn(
          "px-3 py-3 mt-auto border-t border-gray-200 dark:border-gray-700 flex items-center",
          collapsed ? "justify-center" : "justify-start"
        )}
      >
        {collapsed ? (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-xs text-muted-foreground">Admin</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium dark:text-gray-200">John Doe</div>
              <div className="text-xs text-muted-foreground dark:text-gray-400">Admin</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
