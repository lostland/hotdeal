import { Link } from "@shared/schema";
import { ExternalLink, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { KakaoShareButton } from "./kakao-share-button";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LinkCardProps {
  link: Link;
  onClick: () => void;
  onDelete?: () => void;
  hideDeleteButton?: boolean;
  showSettingsButton?: boolean;
  className?: string;
}

export function LinkCard({ link, onClick, onDelete, hideDeleteButton = false, showSettingsButton = false, className, ...props }: LinkCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [isInCenter, setIsInCenter] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editTitle, setEditTitle] = useState(link.title || '');
  const [editNote, setEditNote] = useState(link.note || '');
  const [editCustomImage, setEditCustomImage] = useState(link.customImage || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  // Check if note exists (non-empty, trimmed)
  const hasNote = !!link.note?.trim();
  
  // Check if link has complete metadata (title, image, domain)
  const hasCompleteMetadata = !!(
    link.title?.trim() && 
    (link.image || link.customImage) && 
    link.domain?.trim()
  );
  
  // Only fetch price if:
  // 1. No price exists AND no note exists
  // 2. Link doesn't have complete metadata (needs parsing)
  // 3. Card is visible on screen
  const shouldFetchPrice = (
    (!link.price && !hasNote) || !hasCompleteMetadata
  ) && isVisible;

  // Fetch real-time price only when needed and visible
  const { data: priceData, isLoading: priceLoading } = useQuery<{price: string | null; linkId: string}>({
    queryKey: [`/api/price/${link.id}`],
    enabled: shouldFetchPrice,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Check if card is visible and in center viewport
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Intersection Observer for visibility
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );
    
    observer.observe(cardRef.current);
    
    const checkIfInCenter = () => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const viewport = {
        centerStart: window.innerHeight * 0.35, // 35% from top
        centerEnd: window.innerHeight * 0.65,   // 65% from top
      };
      
      const cardCenter = rect.top + rect.height / 2;
      const inCenter = cardCenter >= viewport.centerStart && cardCenter <= viewport.centerEnd;
      
      setIsInCenter(inCenter);
    };

    // 초기 체크
    checkIfInCenter();
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', checkIfInCenter, { passive: true });
    window.addEventListener('resize', checkIfInCenter);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkIfInCenter);
      window.removeEventListener('resize', checkIfInCenter);
    };
  }, []);

  const displayPrice = hasNote ? null : (link.price || priceData?.price);
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

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditModal(true);
  };

  // URL 수정 뮤테이션
  const updateLinkMutation = useMutation({
    mutationFn: async (data: { oldUrl: string; newUrl: string; title: string; note: string; customImage: string }) => {
      return apiRequest('PUT', '/api/admin/urls', data);
    },
    onSuccess: () => {
      toast({ title: '성공', description: '링크가 수정되었습니다.' });
      queryClient.invalidateQueries({ queryKey: ['/api/links'] });
      setShowEditModal(false);
    },
    onError: (error: any) => {
      toast({ title: '오류', description: error.message || '링크 수정에 실패했습니다.', variant: 'destructive' });
    },
  });

  // URL 삭제 뮤테이션
  const deleteLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest('DELETE', '/api/admin/urls', { url });
    },
    onSuccess: () => {
      toast({ title: '성공', description: '링크가 삭제되었습니다.' });
      queryClient.invalidateQueries({ queryKey: ['/api/links'] });
      setShowEditModal(false);
    },
    onError: (error: any) => {
      toast({ title: '오류', description: error.message || '링크 삭제에 실패했습니다.', variant: 'destructive' });
    },
  });

  const handleSaveEdit = () => {
    updateLinkMutation.mutate({
      oldUrl: link.url,
      newUrl: editUrl,
      title: editTitle,
      note: editNote,
      customImage: editCustomImage,
    });
  };

  const handleCancelEdit = () => {
    setEditUrl(link.url);
    setEditTitle(link.title || '');
    setEditNote(link.note || '');
    setEditCustomImage(link.customImage || '');
    setShowEditModal(false);
  };

  const handleDeleteLink = () => {
    if (confirm('이 링크를 삭제하시겠습니까?')) {
      deleteLinkMutation.mutate(link.url);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: '오류', description: '파일 크기가 너무 큽니다. 최대 10MB까지 가능합니다.', variant: 'destructive' });
      return;
    }

    // 이미지 파일인지 체크
    if (!file.type.startsWith('image/')) {
      toast({ title: '오류', description: '이미지 파일만 업로드 가능합니다.', variant: 'destructive' });
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드에 실패했습니다.');
      }

      const data = await response.json();
      setEditCustomImage(data.imageUrl);
      toast({ title: '성공', description: '이미지가 업로드되었습니다.' });
    } catch (error) {
      console.error('업로드 오류:', error);
      toast({ title: '오류', description: '이미지 업로드에 실패했습니다.', variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
      // input 값 리셋
      event.target.value = '';
    }
  };

  return (
    <article 
      ref={cardRef}
      id={`product-${link.id}`}
      className={cn(
        "link-card bg-card rounded-lg shadow-lg shadow-gray-800/30 dark:shadow-gray-900/60 border-[3px] border-gray-700 dark:border-gray-800 mb-4 overflow-hidden transition-all duration-300 cursor-pointer",
        // hover 효과
        "hover:shadow-xl hover:shadow-gray-600/40 dark:hover:shadow-gray-900/80 hover:border-gray-600 dark:hover:border-gray-700 hover:-translate-y-1 active:scale-98",
        // 스크롤 중앙 위치에서 자동 hover 효과 (더 강한 효과)
        isInCenter && "shadow-2xl shadow-sky-500/50 dark:shadow-sky-400/40 border-sky-500 dark:border-sky-400 -translate-y-2 scale-105",
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

          {/* Settings button overlay */}
          {showSettingsButton && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-100 hover:opacity-100 bg-black/10 hover:bg-gray"
              onClick={handleSettingsClick}
              data-testid={`button-settings-${link.id}`}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="p-4 bg-gradient-to-b from-sky-200 to-purple-100 dark:from-sky-800/60 dark:to-sky-900/40">
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
          
          {hasNote && (
            <div 
              className="text-lg font-bold text-primary mb-2" 
              data-testid={`text-note-${link.id}`}
            >
              {link.note!.trim()}
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
                price={!hasNote ? displayPrice || undefined : undefined}
                note={hasNote ? link.note!.trim() : undefined}
                linkId={link.id}
                data-testid={`kakao-share-${link.id}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>링크 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="edit-note">참고사항</Label>
              <Textarea
                id="edit-note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="가격 정보나 특별 할인 내용을 입력하세요"
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="edit-image">커스텀 이미지</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="edit-image"
                    value={editCustomImage}
                    onChange={(e) => setEditCustomImage(e.target.value)}
                    placeholder="/api/images/... 또는 외부 URL"
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploadingImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingImage}
                      className="px-3"
                    >
                      {isUploadingImage ? '업로드 중...' : '파일 선택'}
                    </Button>
                  </div>
                </div>
                {editCustomImage && (
                  <div className="mt-2">
                    <img
                      src={editCustomImage}
                      alt="미리보기"
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSaveEdit} 
                disabled={updateLinkMutation.isPending}
                className="flex-1"
              >
                {updateLinkMutation.isPending ? '저장 중...' : '저장'}
              </Button>
              <Button 
                onClick={handleDeleteLink} 
                variant="destructive"
                disabled={deleteLinkMutation.isPending}
                className="flex-1"
              >
                {deleteLinkMutation.isPending ? '삭제 중...' : '삭제'}
              </Button>
              <Button 
                onClick={handleCancelEdit} 
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
