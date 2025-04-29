import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RootState } from "@/store";
import { fetchNewsArticles, selectNews } from "@/store/slices/newsSlice";
import { Newspaper } from "lucide-react";
import { getTimeAgo } from "@/lib/utils";
import WidgetWrapper from "./WidgetWrapper";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function NewsWidget() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const dispatch = useDispatch();
  const { articles, loading, error } = useSelector(selectNews);

  useEffect(() => {
    dispatch(fetchNewsArticles({ category: selectedCategory }));
  }, [dispatch, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleRefresh = () => {
    dispatch(fetchNewsArticles({ category: selectedCategory }));
  };

  const handleViewMore = () => {
    // This would navigate to a full news page in a real app
    console.log("Navigate to full news page");
  };

  const handleOpenArticle = (article: any) => {
    setSelectedArticle(article);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  // Filter articles by category if not "all"
  const filteredArticles = selectedCategory === "all" 
    ? articles.slice(0, 4)
    : articles
        .filter(article => article.category.toLowerCase() === selectedCategory)
        .slice(0, 4);

  return (
    <>
      <WidgetWrapper title="Latest News" widgetId="news" onRefresh={handleRefresh}>
        <Tabs defaultValue="all" className="w-full" onValueChange={handleCategoryChange}>
          <TabsList className="mb-4 w-full flex overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="sports">Sports</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            {loading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex space-x-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-red-500">{error}</p>
                <Button variant="outline" onClick={handleRefresh} className="mt-2">
                  Try Again
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-4">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((article, index) => (
                      <div
                        key={index}
                        className="flex border-b border-gray-200 dark:border-gray-700 pb-4 cursor-pointer"
                        onClick={() => handleOpenArticle(article)}
                      >
                        {article.urlToImage ? (
                          <img
                            src={article.urlToImage}
                            alt={article.title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            <Newspaper className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {article.description}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {article.source?.name || "News Source"}
                            </span>
                            <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getTimeAgo(new Date(article.publishedAt))}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No articles found for this category.</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      className="w-full text-primary hover:text-primary/80"
                      onClick={handleViewMore}
                    >
                      View More News
                      <span className="ml-1">→</span>
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </WidgetWrapper>

      {/* Article detail dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && handleCloseArticle()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedArticle?.title}</DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="mr-2">
                  {selectedArticle?.source?.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedArticle?.publishedAt &&
                    new Date(selectedArticle.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          {selectedArticle?.urlToImage && (
            <div className="relative w-full h-64 mb-4 overflow-hidden rounded-md">
              <img
                src={selectedArticle.urlToImage}
                alt={selectedArticle.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="space-y-4">
            <p className="text-muted-foreground">{selectedArticle?.description}</p>
            <p>{selectedArticle?.content}</p>

            {selectedArticle?.url && (
              <div className="flex justify-end">
                <Button
                  variant="default"
                  onClick={() => window.open(selectedArticle.url, "_blank")}
                >
                  Read Full Article
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NewsWidget;
