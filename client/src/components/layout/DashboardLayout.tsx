import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { RootState } from "@/store";
import { useMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { sidebarOpen } = useSelector((state: RootState) => state.theme);
  const isMobile = useMobile();

  // Collapse sidebar automatically on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className={cn("hidden md:block transition-all duration-300")}>
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleCollapse} />
        </div>
      )}

      {/* Mobile Sidebar (Sheet) */}
      {isMobile && (
        <Sheet open={sidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar collapsed={false} onToggleCollapse={toggleCollapse} />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-200 bg-gray-50 dark:bg-gray-900 p-4 md:p-6"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
