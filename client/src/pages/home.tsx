import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { AppHeader } from "@/components/app-header";
import { LinkCard } from "@/components/link-card";
import { LoadingCard } from "@/components/loading-card";
import { ErrorCard } from "@/components/error-card";
import { ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: links = [], isLoading, error, refetch } = useQuery<Link[]>({
    queryKey: ["/api/links"],
  });

  // WebSocket 연결로 실시간 업데이트
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'linksUpdated') {
        // 링크 목록 새로고침
        queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRetryLoad = () => {
    refetch();
  };

  const handleAdminClick = () => {
    window.open('/admin.html', '_blank');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-md mx-auto px-4 py-6">
          <ErrorCard
            title="링크를 불러올 수 없습니다"
            description="네트워크 연결을 확인하고 다시 시도해주세요."
            onRetry={handleRetryLoad}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-md mx-auto pb-20">
        <div className="px-4 pt-4">
          {isLoading ? (
            // Show loading cards
            Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={index} />
            ))
          ) : links.length === 0 ? (
            // Empty state
            <div className="px-4 py-12 text-center" data-testid="empty-state">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">링크가 없습니다</h3>
              <p className="text-sm text-muted-foreground">관리자가 링크를 추가할 때까지 기다려주세요.</p>
            </div>
          ) : (
            // Render link cards
            links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onClick={() => handleLinkClick(link.url)}
                data-testid={`link-card-${link.id}`}
                hideDeleteButton={true}
              />
            ))
          )}
        </div>
      </main>

      {/* Admin Settings Button */}
      <Button
        size="icon"
        variant="ghost"
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full opacity-30 hover:opacity-60 transition-opacity duration-200 bg-background/80 backdrop-blur-sm border border-border/40"
        onClick={handleAdminClick}
        data-testid="button-admin-settings"
      >
        <Settings className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  );
}