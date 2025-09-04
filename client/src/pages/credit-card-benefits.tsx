import { ChevronLeft, CreditCard, Star, TrendingUp, Gift, Calculator, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CreditCardBenefits() {
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
          <h1 className="text-lg font-semibold text-foreground">신용카드 혜택 활용법</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">똑똑한 카드 활용</h2>
          </div>
          <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
            신용카드 혜택과 핫딜을 함께 활용해서 월 최대 7만원까지 
            할인받고 포인트도 쌓는 완벽 가이드를 알려드립니다!
          </p>
        </div>

        {/* Top Cards 2025 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            2025년 최고 혜택 카드 TOP 5
          </h3>

          {/* Card Rankings */}
          <div className="space-y-4">
            {/* LOCA LIKIT */}
            <div className="bg-card border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="font-bold text-foreground">LOCA LIKIT 1.2카드</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">온라인 결제 특화: 1.5% 할인</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">전월실적 없음, 할인한도 없음</div>
                </div>
                <p className="text-xs text-muted-foreground">💡 온라인 쇼핑 메인카드로 최적</p>
              </div>
            </div>

            {/* Samsung iD ON */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="font-bold text-foreground">삼성 iD ON 카드</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">맞춤 할인: 최대 30% 할인</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">전월실적 30만원, 월 최대 4만원</div>
                </div>
                <p className="text-xs text-muted-foreground">💡 카페/배달앱/편의점 집중 이용자</p>
              </div>
            </div>

            {/* Shinhan 처음 */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="font-bold text-foreground">신한카드 처음</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">OTT/멤버십 특화</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">전월실적 40만원, 월 최대 7만원</div>
                </div>
                <p className="text-xs text-muted-foreground">💡 넷플릭스, 유튜브프리미엄 등 구독서비스</p>
              </div>
            </div>

            {/* Mr.Life */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <h4 className="font-bold text-foreground">신한카드 Mr.Life</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">생활비 특화: 통신비 10% 할인</div>
                  <div className="text-xs text-green-600 dark:text-green-400">전월실적 50만원, 월 최대 5만원</div>
                </div>
                <p className="text-xs text-muted-foreground">💡 통신비, 전기/가스요금, 병원비</p>
              </div>
            </div>

            {/* FLEX */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                <h4 className="font-bold text-foreground">올바른 FLEX카드</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-300">렌탈+쇼핑 특화</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">전월실적 30만원, 월 최대 3.2만원</div>
                </div>
                <p className="text-xs text-muted-foreground">💡 정수기, 공기청정기 렌탈 이용자</p>
              </div>
            </div>
          </div>
        </div>

        {/* Point Strategy */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            포인트 적립 최대화 전략
          </h3>

          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">카드 선택 기준</h4>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">1. 소비 패턴 분석</div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  온라인쇼핑/카페/배달앱 중 어디를 가장 많이 쓰는지 확인
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                <div className="font-medium text-purple-700 dark:text-purple-300 mb-1">2. 실적 조건</div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  전월실적 30만원~60만원 수준이 현실적
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                <div className="font-medium text-green-700 dark:text-green-300 mb-1">3. 적립 한도</div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  월 3~7만원 혜택 한도 확인
                </p>
              </div>
            </div>
          </div>

          {/* Point Usage */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-500" />
              포인트 활용 방법
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">현금처럼 사용</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">1포인트 = 1원으로 가맹점에서 현금 사용</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">결제대금 차감</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">카드대금에서 직접 차감</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">상품권 교환</div>
                <div className="text-xs text-green-600 dark:text-green-400">백화점, 마트 상품권으로 교환</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">마일리지 전환</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">항공사 마일리지로 전환 (최소 10,000포인트)</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                <div className="text-sm font-medium text-orange-700 dark:text-orange-300">기부</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">연말정산 혜택까지 받을 수 있는 포인트 기부</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shopping Discount Strategy */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-bold text-foreground">온라인 쇼핑 할인 극대화</h3>

          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">정부 혜택 병행 활용</h4>
            <div className="space-y-2">
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <div className="text-sm font-medium text-red-700 dark:text-red-300">2025 민생회복 소비쿠폰</div>
                <div className="text-xs text-red-600 dark:text-red-400">15만원 (7월~11월 사용)</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">코리아세일페스타</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">11월 대규모 할인 이벤트</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">토스페이 쿠폰</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">백화점, 홈쇼핑 추가 할인</div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">시즌별 전략</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>5월, 12월:</strong> 가족행사 많은 달 - 추가 적립 한도 제공 카드 활용</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>주말:</strong> 배달앱, 음식점 특화 혜택 활용</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>연말:</strong> 포인트 소멸 전 사용, 기부를 통한 세제혜택</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-card border border-border rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-500" />
            카드별 혜택 비교
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">카드명</th>
                  <th className="text-center py-2 text-muted-foreground">온라인</th>
                  <th className="text-center py-2 text-muted-foreground">전월실적</th>
                  <th className="text-center py-2 text-muted-foreground">월혜택</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b border-border">
                  <td className="py-2 font-medium">LOCA LIKIT</td>
                  <td className="text-center py-2 text-yellow-600">1.5%</td>
                  <td className="text-center py-2 text-green-600">없음</td>
                  <td className="text-center py-2 text-purple-600">무제한</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-medium">삼성 iD ON</td>
                  <td className="text-center py-2 text-yellow-600">30%</td>
                  <td className="text-center py-2">30만원</td>
                  <td className="text-center py-2 text-purple-600">4만원</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-medium">신한 처음</td>
                  <td className="text-center py-2 text-blue-600">포인트</td>
                  <td className="text-center py-2">40만원</td>
                  <td className="text-center py-2 text-purple-600">7만원</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Mr.Life</td>
                  <td className="text-center py-2">-</td>
                  <td className="text-center py-2">50만원</td>
                  <td className="text-center py-2 text-purple-600">5만원</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Point Management */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">포인트 관리 팁</h3>
          </div>
          <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
            <li>• <strong>유효기간:</strong> 대부분 5년 (적립일 기준)</li>
            <li>• <strong>소멸 예정 알림:</strong> 6개월 전부터 안내</li>
            <li>• <strong>자동 기부 설정:</strong> 소멸 예정 포인트 자동 기부 가능</li>
          </ul>
        </div>

        {/* Final Tip */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-6">
          <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">스마트 활용법</h4>
          <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
            본인의 소비패턴에 맞는 카드를 선택하고, 포인트와 할인혜택을 최대한 활용해보세요! 
            정부 혜택과 카드 혜택을 함께 사용하면 <strong>월 10만원 이상 절약</strong>도 가능합니다.
          </p>
        </div>
      </main>
    </div>
  );
}