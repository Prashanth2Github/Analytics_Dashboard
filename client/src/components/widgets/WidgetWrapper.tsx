import React, { useRef } from "react";
import { useDrag } from "@/hooks/use-drag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreVertical, RefreshCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetWrapperProps {
  title: string;
  widgetId: string;
  className?: string;
  onRefresh?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
  colSpan?: string;
}

export function WidgetWrapper({
  title,
  widgetId,
  className,
  onRefresh,
  onRemove,
  children,
  colSpan = "",
}: WidgetWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { dragProps } = useDrag(cardRef, widgetId);

  return (
    <Card
      ref={cardRef}
      className={cn(
        "widget bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-all duration-200 hover:shadow-md cursor-grab active:cursor-grabbing",
        colSpan,
        className
      )}
      {...dragProps}
    >
      <CardHeader className="px-4 py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRefresh && (
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                <span>Refresh</span>
              </DropdownMenuItem>
            )}
            {onRemove && (
              <DropdownMenuItem onClick={onRemove} className="text-red-600">
                <X className="mr-2 h-4 w-4" />
                <span>Remove</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 py-0 pb-4">{children}</CardContent>
    </Card>
  );
}

export default WidgetWrapper;
