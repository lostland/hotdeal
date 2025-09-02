import { ExternalLink } from "lucide-react";

export function AppHeader() {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40" data-testid="app-header">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-title">
              링크 모음
            </h1>
            <p className="text-xs text-muted-foreground" data-testid="text-subtitle">
              웹사이트 썸네일 뷰어
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
