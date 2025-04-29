import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toggleSidebar } from "@/store/slices/themeSlice";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMobile();
  const dispatch = useDispatch();

  // After mounting, we can safely show the theme toggle (to avoid hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Implement search functionality
  };

  const toggleMobileSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center px-4 py-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="md:hidden"
            aria-label="Toggle sidebar"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        <div className={`${isMobile ? "w-full max-w-[180px]" : "w-full max-w-md"} mx-4`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search dashboard..."
              className="pl-9 pr-4 h-9"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="text-gray-500 dark:text-gray-300"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="h-2 w-2 absolute top-1 right-1 bg-red-500 p-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-medium">New weather data available</span>
                  <span className="text-xs text-muted-foreground">2 minutes ago</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-medium">Stock market update</span>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
