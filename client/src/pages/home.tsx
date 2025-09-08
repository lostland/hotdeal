import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppHeader } from "@/components/app-header";
import { LinkCard } from "@/components/link-card";
import { LoadingCard } from "@/components/loading-card";
import { ErrorCard } from "@/components/error-card";
import { ExternalLink, Settings, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: allLinks = [], isLoading, error, refetch } = useQuery<Link[]>({
    queryKey: ["/api/links"],
  });

  // 빈 URL인 링크는 화면에 표시하지 않음
  const links = allLinks.filter(link => link.url && link.url.trim());

  // 서버에서 통계 정보 가져오기
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<{ visitorCount: number; shareCount: number }>({
    queryKey: ["/api/stats"],
  });

  // 통계 데이터가 없으면 기본값 사용
  const displayStats = stats || { visitorCount: 0, shareCount: 0 };

  // 방문자 수 증가 mutation
  const visitMutation = useMutation({
    mutationFn: () => apiRequest("/api/stats/visit", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  // 공유 수 증가 mutation
  const shareMutation = useMutation({
    mutationFn: () => apiRequest("/api/stats/share", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  // 페이지 로드 시 방문자수 증가
  useEffect(() => {
    visitMutation.mutate();
  }, []);

  // 공유수 증가 함수
  const incrementShareCount = () => {
    shareMutation.mutate();
  };

  // 전역 공유 함수로 컨텍스트에 등록
  useEffect(() => {
    (window as any).incrementShareCount = incrementShareCount;
    return () => {
      delete (window as any).incrementShareCount;
    };
  }, [incrementShareCount]);

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

  // URL 해시로 상품 위치로 스크롤
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#product-')) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500); // 데이터 로딩 후 스크롤
      }
    }
  }, [links]);

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRetryLoad = () => {
    refetch();
  };

  const handleAdminClick = () => {
    window.open('/admin', '_blank');
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

            
            <>

              {/* ───────────────── 홍보성 안내 카드 ───────────────── */}
              <div className="rounded-2xl overflow-hidden shadow-md border border-yellow-300 dark:border-yellow-600 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 mb-8">
                <div className="p-4 text-center">
                  <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                    🚀 실시간 새롭게 추가되는 핫딜!
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    하루 최소 한 번은 꼭 확인해야 하는 특가 소식 🎉  
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    <strong>핫딜 레디!</strong>에서 오늘의 새로운 딜을 한눈에 만나보세요!

                    {/* Admin 버튼 */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-10 h-10 rounded-full opacity-30 hover:opacity-60 transition-opacity duration-200 bg-background/80 backdrop-blur-sm border border-border/40"
                      onClick={handleAdminClick}
                      data-testid="button-admin-settings"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    
                  </p>
                </div>
              </div>

              
              {/* Render link cards */}
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onClick={() => handleLinkClick(link.url)}
                  data-testid={`link-card-${link.id}`}
                  hideDeleteButton={true}
                />
              ))}
              
             
            </>
          )}

          {/* ───────────────── 서비스 소개 ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-3">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">핫딜 레디! 안내</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                이 페이지는 여러 쇼핑몰에 흩어진 <strong>실시간 특가</strong>를 한눈에 모아 보여줍니다.
                각 카드에서 가격·옵션·간단 코멘트를 확인하고, 필요 시 <strong>공유</strong> 버튼으로 친구에게 바로 보내보세요.
              
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>매일 바뀌는 타임세일/한정수량 위주로 업데이트</li>
                <li>생활·식품·가전·패션·여행 등 카테고리별 큐레이션</li>
                <li>카드/포인트/쿠폰 조합까지 고려한 <strong>체감가</strong> 안내</li>
              </ul>
            </div>
          </div>

          {/* ───────────────── 이용 방법 ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 p-3">
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">이용 방법</h3>
            </div>
            <div className="p-4">
              <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <li>관심 상품 카드를 눌러 <strong>상세 정보</strong>를 확인합니다.</li>
                <li>가격, 옵션, 배송비와 적용 가능한 <strong>쿠폰</strong>을 체크합니다.</li>
                <li>원하는 상품이 있으면 <strong>장바구니</strong>에 담아 결제합니다.</li>           
                <li>결제 직전에 <strong>최종 결제 금액</strong>과 재고/배송일을 다시 확인하세요.</li>
                
              </ol>
              <p className="mt-3 text-xs text-slate-500">
                * 인앱 브라우저에서 결제가 원활하지 않으면 우측 상단 메뉴에서 <strong>브라우저로 열기(Chrome/Safari)</strong>를 사용하세요.
              </p>
            </div>
          </div>

          {/* ───────────────── 가격 변동/품절 주의 ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-3">
              <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">가격 변동 & 품절 주의</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <li>핫딜은 노출 후 <strong>짧은 시간 내</strong> 가격이 바뀌거나 품절될 수 있습니다.</li>
                <li>쿠폰/포인트는 <strong>계정·시간대·앱 환경</strong>에 따라 적용 기준이 다를 수 있습니다.</li>
                <li>동일 상품이라도 <strong>옵션/판매자</strong>에 따라 배송비와 체감가가 달라질 수 있어요.</li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                팁: 장바구니 담은 뒤 결제 단계에서 총액·쿠폰 적용 여부·배송일을 최종 확인하세요.
              </p>
            </div>
          </div>

          {/* ───────────────── 법적 책임 안내 ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 p-3">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">서비스 및 법적 책임 안내</h3>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong>핫딜 레디!</strong>는 온라인에 흩어져 있는 특가/할인 상품 정보를 모아 보여주는 <em>정보 제공 서비스</em>입니다.
                저희는 상품의 <strong>직접적인 판매자</strong>가 아니며, 결제·배송·A/S 등 구매 이후의 절차와는 무관합니다.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <li>
                  모든 상품은 연결된 <strong>각 쇼핑몰·판매처</strong>에서 판매되며, 실제 구매 계약은 해당 판매자와 사용자 간에 체결됩니다.
                </li>
                <li>
                  가격, 재고, 혜택, 배송, 환불/교환 등과 관련된 권리·의무는 전적으로 <strong>판매처의 정책</strong>에 따릅니다.
                </li>
                <li>
                  본 사이트에 표시되는 상품 정보는 수시로 변동될 수 있으며, 
                  <strong>정확한 정보는 반드시 결제 직전 판매처 페이지</strong>에서 확인해야 합니다.
                </li>
              </ul>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                따라서 <strong>핫딜 레디!</strong>는 상품의 품질, 배송, 환불·교환, 소비자 분쟁 등에 대한 <strong>법적 책임을 지지 않습니다</strong>.  
                모든 책임은 실제 판매자와 구매자에게 귀속됩니다.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                ※ 본 서비스는 단순히 정보를 수집·정리하여 제공하는 플랫폼이며, 
                <strong>광고/마케팅/중개 행위</strong>로 간주되지 않습니다.
              </p>
            </div>
          </div>


          {/* ───────────────── 핫딜 쇼핑 가이드 ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 p-3">
              <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">핫딜 쇼핑 가이드</h3>
            </div>
            <div className="p-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                <li>
                  <a href="/post/how-to-find-real-deals" className="text-blue-600 dark:text-blue-400 hover:underline">
                    진짜 핫딜 vs 가짜 할인 구분법
                  </a>
                </li>
                <li>
                  <a href="/post/black-friday-guide" className="text-blue-600 dark:text-blue-400 hover:underline">
                    블랙프라이데이 똑똑하게 쇼핑하는 방법
                  </a>
                </li>
                <li>
                  <a href="/post/credit-card-benefits" className="text-blue-600 dark:text-blue-400 hover:underline">
                    신용카드 혜택과 핫딜을 함께 활용하기
                  </a>
                </li>
                <li>
                  <a href="/post/travel-hotdeals" className="text-blue-600 dark:text-blue-400 hover:underline">
                    여행 상품 핫딜, 놓치지 않고 잡는 꿀팁
                  </a>
                </li>
              </ul>
              
            </div>
          </div>
          

          {/* ───────────────── 똑똑한 구매 팁 ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 p-3">
              <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-300">똑똑한 구매 팁</h3>
            </div>
            <div className="p-4">
              <ul className="grid gap-2 text-sm text-slate-700 dark:text-slate-200">
                <li>카드사 행사/간편결제 추가 혜택으로 <strong>체감가</strong> 계산하기</li>
                <li>리뷰 수와 최근 날짜 리뷰 우선 확인, <strong>교환/반품 정책</strong> 체크</li>
                <li>식품·생필품은 <strong>유통기한/원산지</strong> 표기 확인</li>
                <li>전자제품은 <strong>모델명/보증기간/AS</strong> 꼭 확인</li>
              </ul>
            </div>
          </div>

          {/* ───────────────── 카테고리 안내(선택) ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-sky-100 to-cyan-100 dark:from-sky-900/30 dark:to-cyan-900/30 p-3">
              <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-300">카테고리 활용법</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                원하는 상품을 더 빨리 찾고 싶다면 카테고리/필터를 함께 사용하세요.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li><strong>가격대</strong>: 예산 구간으로 좁히기</li>
                <li><strong>즉시할인/쿠폰</strong>: 체감가 기준으로 정렬</li>
                <li><strong>무료배송</strong>: 배송비 포함 총액 기준 비교</li>
                <li><strong>신규/재진열</strong>: 새로 뜬 딜부터 확인</li>
              </ul>
            </div>
          </div>

          {/* ───────────────── FAQ ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 p-3">
              <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">자주 묻는 질문</h3>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Q. 실제 판매/배송은 어디서 하나요?</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">연결된 각 쇼핑몰에서 진행됩니다. 결제·배송·CS 정책은 판매처 기준을 따릅니다.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Q. 가격이 카드와 다르게 보일 때가 있어요.</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">시간/계정/앱 환경에 따라 쿠폰 적용과 재고가 달라질 수 있습니다. 결제 직전 최종가를 꼭 확인하세요.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Q. 인앱 브라우저에서 오류가 납니다.</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">우측 상단 메뉴에서 <strong>브라우저로 열기</strong>를 선택하면 해결되는 경우가 많습니다.</p>
              </div>
            </div>
          </div>

          {/* ───────────────── 문의/제보 ───────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-4">
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800/40 dark:to-slate-700/40 p-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">문의 & 제보</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                놓치기 아까운 특가를 발견하셨나요? 오류나 개선 의견도 환영합니다. 아래 버튼으로 간편하게 알려주세요.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <a href="mailto:freshkim1026@gmail.com" className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold">이메일 보내기</a>
                
              </div>
            </div>
          </div>

        </div>

        {/* 통계 및 관리자 버튼 영역 */}
        <div className="px-4 py-6 flex items-center justify-between">
          {/* 방문자수와 공유수 통계 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{displayStats.visitorCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span>{displayStats.shareCount.toLocaleString()}</span>
            </div>
          </div>
          
          
        </div>
      </main>
    </div>
  );
}