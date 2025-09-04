import { ChevronLeft, Shield, AlertTriangle, CheckCircle2, Search, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function HowToFindRealDeals() {
  const [, setLocation] = useLocation();

  const handleGoBack = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={handleGoBack}
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">진짜 핫딜 vs 가짜 할인 구분법</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
            <h2 className="text-xl font-bold text-orange-800 dark:text-orange-200">똑똑한 쇼핑의 첫걸음</h2>
          </div>
          <p className="text-orange-700 dark:text-orange-300 text-sm leading-relaxed">
            90% 이상 할인? 너무 좋은 조건일 때는 한 번 더 의심해보세요. 
            진짜 핫딜과 가짜 할인을 구분하는 방법을 알려드립니다!
          </p>
        </div>

        {/* Warning Section */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-700 dark:text-red-300">가짜 할인의 실태</h3>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
            해외 온라인 플랫폼에서 초저가로 판매되는 국내 브랜드 제품 4개 중 3개가 위조 상품으로 밝혀졌습니다. 
            정상가 대비 45~97% 할인된 가격으로 판매되는 제품들 중 대부분이 가짜였어요.
          </p>
        </div>

        {/* How to Check Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            진짜 핫딜 구분 방법
          </h3>

          {/* Price Verification */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              가격 검증 방법
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>가격비교 사이트 활용:</strong> 네이버쇼핑, 다나와, 쇼핑하우 등에서 실제 시장가 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>과거 가격 추적:</strong> 할인 전 실제 판매 가격이 있었는지 확인</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>할인율 의심:</strong> 70% 이상의 극단적인 할인은 대부분 가짜</span>
              </li>
            </ul>
          </div>

          {/* Trusted Sources */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              신뢰할 수 있는 핫딜 사이트
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div className="font-medium text-green-700 dark:text-green-300">커뮤니티</div>
                <div className="text-green-600 dark:text-green-400 text-xs">
                  뽐뿌, 쿨앤조이<br/>
                  퀘이사존, 에펨코리아
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div className="font-medium text-blue-700 dark:text-blue-300">가격비교</div>
                <div className="text-blue-600 dark:text-blue-400 text-xs">
                  쇼핑하우, 다나와<br/>
                  네이버쇼핑
                </div>
              </div>
            </div>
          </div>

          {/* Counterfeit Detection */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">위조품 판별법</h4>
            <div className="space-y-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                <div className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">라벨 확인</div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  중국어 표기, 검사필 표시 없음, 제조자명 누락 등을 주의하세요
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                <div className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">품질 확인</div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  로고 품질 저하, 원단 품질 차이, 디자인 변형 등을 체크하세요
                </p>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">체크리스트</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-600 dark:text-green-400">신뢰 신호</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                  <li>• 공식 판매처/브랜드 자사몰</li>
                  <li>• 사용자 리뷰 다수 존재</li>
                  <li>• 명확한 상품 상세정보</li>
                  <li>• 정상적인 A/S 정책</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-red-600 dark:text-red-400">위험 신호</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                  <li>• 90% 이상 극단적 할인율</li>
                  <li>• 판매자 정보 불명확</li>
                  <li>• 중국어 라벨/설명서</li>
                  <li>• 검증되지 않은 해외 플랫폼</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Principle */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">핵심 원칙</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
              <strong>너무 좋은 조건일 때는 한 번 더 의심해보세요.</strong> 
              소비자는 자신이 지불할 수 있는 비용의 임계점을 계산한 뒤 거래하는 것이 현명합니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}