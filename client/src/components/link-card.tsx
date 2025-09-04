import { Link } from "@shared/schema";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { KakaoShareButton } from "./kakao-share-button";

interface LinkCardProps {
  link: Link;
  onClick: () => void;
  onDelete?: () => void;
  hideDeleteButton?: boolean;
  className?: string;
}

export function LinkCard({ link, onClick, onDelete, hideDeleteButton = false, className, ...props }: LinkCardProps) {
  // Fetch real-time price if link.price is null
  const { data: priceData, isLoading: priceLoading } = useQuery<{price: string | null; linkId: string}>({
    queryKey: [`/api/price/${link.id}`],
    enabled: !link.price, // Only fetch if price is null
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const displayPrice = link.price || priceData?.price;
  const getDomainIcon = (domain: string) => {
    if (domain.includes('naver')) {
      return <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-xs font-bold">N</span>
      </div>;
    }
    if (domain.includes('kakao')) {
      return <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
        <span className="text-black text-xs font-bold">K</span>
      </div>;
    }
    if (domain.includes('gmarket')) {
      return <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-xs font-bold">G</span>
      </div>;
    }
    return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
      <ExternalLink className="w-2 h-2 text-white" />
    </div>;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const handleKakaoShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <article 
      id={`product-${link.id}`}
      className={cn(
        "link-card bg-card rounded-lg shadow-sm border-2 border-slate-300 dark:border-slate-600 mb-4 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-500/20 hover:border-blue-400 dark:hover:border-blue-400 hover:-translate-y-1 active:scale-98 cursor-pointer",
        className
      )}
      {...props}
    >
      <div onClick={handleCardClick} className="block">
        <div className="aspect-video overflow-hidden relative">
          {(link.customImage || link.image) ? (
            <img 
              src={link.customImage || link.image || ""} 
              alt={link.title || "Website preview"} 
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              loading="lazy"
              data-testid={`img-thumbnail-${link.id}`}
              onError={(e) => {
                console.error('이미지 로딩 실패:', link.customImage || link.image);
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                if (placeholder) {
                  placeholder.style.display = 'flex';
                }
              }}
            />
          ) : null}
          {/* Fallback placeholder - always rendered but hidden by default when image exists */}
          <div 
            className={`w-full h-full bg-muted flex items-center justify-center ${(link.customImage || link.image) ? 'hidden' : 'flex'}`}
            data-testid={`placeholder-${link.id}`}
          >
            <ExternalLink className="w-8 h-8 text-muted-foreground" />
          </div>
          
          {/* Delete button overlay */}
          {!hideDeleteButton && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-80 hover:opacity-100"
              onClick={handleDeleteClick}
              data-testid={`button-delete-${link.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 
              className="text-base font-medium text-foreground line-clamp-2 leading-tight flex-1" 
              data-testid={`text-title-${link.id}`}
            >
              {link.title || `${link.domain} 상품`}
            </h3>
            <div className="flex-shrink-0 w-5 h-5 text-primary">
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
          
          {displayPrice && (
            <div 
              className="text-lg font-bold text-primary mb-2" 
              data-testid={`text-price-${link.id}`}
            >
              {displayPrice}
            </div>
          )}
          
          {link.note && (
            <div 
              className="text-lg font-bold text-primary mb-2" 
              data-testid={`text-note-${link.id}`}
            >
              {link.note}
            </div>
          )}
          
          {link.description && (
            <p 
              className="text-sm text-muted-foreground mb-3 line-clamp-2" 
              data-testid={`text-description-${link.id}`}
            >
              {link.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getDomainIcon(link.domain || "")}
              <span 
                className="text-xs text-muted-foreground font-medium truncate" 
                data-testid={`text-domain-${link.id}`}
              >
                {link.domain}
              </span>
            </div>
            
            {/* 카카오 공유 버튼 */}
            <div onClick={handleKakaoShareClick}>
              <KakaoShareButton
                title={link.title || `${link.domain} 상품`}
                description={link.description || undefined}
                imageUrl={link.customImage || link.image || undefined}
                price={displayPrice || undefined}
                note={link.note || undefined}
                linkId={link.id}
                data-testid={`kakao-share-${link.id}`}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
