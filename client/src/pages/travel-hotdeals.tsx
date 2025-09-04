import { ChevronLeft, Plane, MapPin, Calendar, Percent, Smartphone, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function TravelHotdeals() {
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
          <h1 className="text-lg font-semibold text-foreground">여행 핫딜 완벽 가이드</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Plane className="w-8 h-8 text-sky-600" />
            <h2 className="text-xl font-bold text-sky-800 dark:text-sky-200">여행비 50% 절약</h2>
          </div>
          <p className="text-sky-700 dark:text-sky-300 text-sm leading-relaxed">
            항공료, 숙박비를 절반으로 줄이는 핫딜 노하우와 
            정부 지원 할인까지 놓치지 않는 완벽 가이드를 알려드립니다! ✈️
          </p>
        </div>

        {/* Government Support */}
        <div className="bg-card border-2 border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            2025 정부 지원 할인 프로그램
          </h3>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="font-bold text-green-700 dark:text-green-300 mb-2">🎉 대한민국 숙박세일 페스타</div>
            <div className="space-y-2">
              <div className="bg-white dark:bg-green-800/20 p-2 rounded">
                <div className="text-sm font-medium text-green-600 dark:text-green-300">7만원 이상 → 5만원 할인</div>
              </div>
              <div className="bg-white dark:bg-green-800/20 p-2 rounded">
                <div className="text-sm font-medium text-green-600 dark:text-green-300">3-7만원 → 3만원 할인</div>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                매일 오전 10시 선착순 발급 • 비수도권 지역만 할인 대상
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-sm font-medium text-muted-foreground mb-2">참여 플랫폼</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">여기어때</div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-center">하나투어</div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-center">네이버예약</div>
              <div className="bg-pink-50 dark:bg-pink-900/20 p-2 rounded text-center">쿠팡트래블</div>
            </div>
          </div>
        </div>

        {/* Flight Discount Strategy */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-500" />
            항공료 절약 핵심 전략
          </h3>

          {/* Booking Timing */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              예약 타이밍이 전부
            </h4>
            <div className="space-y-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">국제선</div>
                <p className="text-sm text-blue-600 dark:text-blue-400">출발 3-4개월 전 예약</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                <div className="font-medium text-purple-700 dark:text-purple-300 mb-1">국내선</div>
                <p className="text-sm text-purple-600 dark:text-purple-400">6-8주 전 예약</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                <div className="font-medium text-red-700 dark:text-red-300 mb-1">땡처리</div>
                <p className="text-sm text-red-600 dark:text-red-400">출발 1-2주 전 최대 70% 할인</p>
              </div>
            </div>
          </div>

          {/* Discount Airlines */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">2025년 저가항공사 순위</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div className="flex-1">
                  <div className="font-medium text-yellow-700 dark:text-yellow-300">제주항공</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">42대 보유, 노선 최다</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div className="flex-1">
                  <div className="font-medium text-blue-700 dark:text-blue-300">티웨이항공</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">30대, 동남아 특화</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div className="flex-1">
                  <div className="font-medium text-green-700 dark:text-green-300">진에어</div>
                  <div className="text-xs text-green-600 dark:text-green-400">26대, 대한항공 자회사</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Flight Tips */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">항공료 추가 할인 꿀팁</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>수하물 없는 여행:</strong> 기본요금만으로 50% 절약</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>공항 선택:</strong> 인천 외 김포/김해 등 지역공항 활용</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>신용카드 할인:</strong> 항공사 제휴카드로 5-15% 추가할인</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>마일리지:</strong> 적립 후 무료 항공권 교환</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Accommodation Strategy */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            숙박 할인 완벽 공략
          </h3>

          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">숙박 할인 전략</h4>
            <div className="space-y-2">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                <div className="font-medium text-red-700 dark:text-red-300 mb-1">쿠폰 발급일 체크</div>
                <p className="text-sm text-red-600 dark:text-red-400">매일 오전 10시 정각 대기</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">평일 예약</div>
                <p className="text-sm text-blue-600 dark:text-blue-400">주말 대비 30-50% 저렴</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                <div className="font-medium text-green-700 dark:text-green-300 mb-1">비수도권 집중</div>
                <p className="text-sm text-green-600 dark:text-green-400">서울/경기/인천 제외 지역만 할인</p>
              </div>
            </div>
          </div>
        </div>

        {/* Price Comparison Tools */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-500" />
            필수 앱 & 웹사이트
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 text-blue-600">가격비교 필수</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">스카이스캐너</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">네이버항공권</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-center">
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">구글플라이트</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-center">
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-300">트립닷컴</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 text-red-600">땡처리 전문</h4>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                <div className="font-medium text-red-700 dark:text-red-300">땡처리닷컴</div>
                <div className="text-sm text-red-600 dark:text-red-400">국내 최초 땡처리 전문</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 text-green-600">정부 할인</h4>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                <div className="font-medium text-green-700 dark:text-green-300">ktostay.visitkorea.or.kr</div>
                <div className="text-sm text-green-600 dark:text-green-400">숙박세일 페스타 공식</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Benefits */}
        <div className="bg-card border border-border rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Percent className="w-5 h-5 text-purple-500" />
            추천 할인 방식
          </h3>
          <div className="space-y-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">네이버페이</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">매일 적립 이벤트</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">토스페이</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">제주항공 최대 15,000원 할인</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">신용카드 마일리지</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">장기적 무료항공권 확보</div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-bold text-foreground">실전 예약 체크리스트</h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 text-blue-600">숙박 예약시</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>쿠폰 발급일 오전 10시 대기</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>여러 OTA 동시 확인</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>비수도권 지역 우선 선택</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>취소 정책 사전 확인</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 text-purple-600">항공 예약시</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>3개월 전 얼리버드 확인</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>5개 이상 플랫폼 가격비교</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>수하물/기내식 별도 비용 계산</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>저가항공 변경/취소 제약 확인</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 text-red-600">땡처리 노리는 법</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>출발 2주 전부터 매일 체크</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>날짜 유연하게 조정 가능한 상태</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>즉시 결제 가능하도록 카드 준비</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-orange-700 dark:text-orange-300">여행사별 특가 이벤트</h3>
          </div>
          <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
            <li>• <strong>하나투어:</strong> 6년 연속 고객만족도 1위, 실시간 특가</li>
            <li>• <strong>모두투어:</strong> 패키지 + 에어텔 결합 할인</li>
            <li>• <strong>노랑풍선:</strong> 허니문/가족여행 전문 할인</li>
          </ul>
        </div>

        {/* Success Tip */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-sky-200 dark:border-sky-800 mt-6">
          <h4 className="font-bold text-sky-700 dark:text-sky-300 mb-2">여행비 절약 성공법</h4>
          <p className="text-sm text-sky-600 dark:text-sky-400 leading-relaxed">
            이 가이드를 따라하면 <strong>여행비용을 50% 이상 절약</strong>하면서도 좋은 여행을 즐길 수 있습니다! 
            정부 할인과 타이밍을 잘 맞추면 더 큰 절약이 가능해요. 🌟
          </p>
        </div>
      </main>
    </div>
  );
}