import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <article className="bg-card rounded-lg shadow-sm border border-border mb-4 overflow-hidden" data-testid="loading-card">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-2/3 mb-3" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-sm" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </article>
  );
}
