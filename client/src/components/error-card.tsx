import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorCard({ 
  title = "링크를 불러올 수 없습니다", 
  description = "네트워크 연결을 확인하고 다시 시도해주세요.",
  onRetry 
}: ErrorCardProps) {
  return (
    <article className="border-2 border-dashed border-border bg-muted rounded-lg mb-4 overflow-hidden p-6 text-center" data-testid="error-card">
      <div className="w-12 h-12 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-2" data-testid="text-error-title">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground mb-4" data-testid="text-error-description">
        {description}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          data-testid="button-retry"
        >
          다시 시도
        </Button>
      )}
    </article>
  );
}
