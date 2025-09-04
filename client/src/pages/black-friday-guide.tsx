import { ChevronLeft, Calendar, ShoppingBag, Clock, CreditCard, Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function BlackFridayGuide() {
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
          <h1 className="text-lg font-semibold text-foreground">블랙프라이데이 똑똑한 쇼핑법</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-black via-gray-800 to-gray-900 text-white rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-yellow-400" />
            <h2 className="text-xl font-bold">블랙프라이데이 2025</h2>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            사전 준비가 성공의 핵심! 최대 할인 혜택을 놓치지 않고 
            똑똑하게 쇼핑하는 완벽 가이드를 알려드립니다.
          </p>
        </div>

        {/* Schedule Section */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            2025 핵심 일정
          </h3>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">메인 일정</div>
              <p className="text-sm text-blue-600 dark:text-blue-400">11월 29일 금요일 (매년 11월 마지막주 금요일)</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
              <div className="font-medium text-purple-700 dark:text-purple-300 mb-1">실제 할인 기간</div>
              <p className="text-sm text-purple-600 dark:text-purple-400">11월 초부터 한 달 이상 "블랙 노벰버" 형태로 진행</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <div className="font-medium text-green-700 dark:text-green-300 mb-1">국내 할인</div>
              <p className="text-sm text-green-600 dark:text-green-400">코리아 세일 페스타 (11월 9일~30일)</p>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3">주요 할인 품목 & 할인율</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
              <div className="font-medium text-orange-700 dark:text-orange-300 text-sm mb-1">전자제품 🔥</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                노트북, 스마트폰<br/>
                애플 제품 기프트카드
              </p>
            </div>
            <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded">
              <div className="font-medium text-pink-700 dark:text-pink-300 text-sm mb-1">패션/뷰티</div>
              <p className="text-xs text-pink-600 dark:text-pink-400">
                나이키, 아디다스<br/>
                화장품, 향수
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
              <div className="font-medium text-yellow-700 dark:text-yellow-300 text-sm mb-1">완구/키즈</div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                장난감 최대 85% 할인<br/>
                키즈 브랜드 대폭 할인
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <div className="font-medium text-blue-700 dark:text-blue-300 text-sm mb-1">주방가전</div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                키친에이드 믹서<br/>
                고가 주방용품 할인
              </p>
            </div>
          </div>
        </div>

        {/* Preparation Strategy */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            사전 준비 전략
          </h3>

          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">1. 미리 조사하기</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>가격 조사:</strong> 구매 목록 작성하고 현재 가격 기록하여 좋은 거래 즉시 파악</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>위시리스트:</strong> 원하는 제품을 미리 위시리스트에 추가해 빠른 구매 준비</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>가격 알림:</strong> 쇼핑몰 가격 알림 기능 활용해 할인 시작과 동시에 알림</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">2. 정보 수집</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>뉴스레터 가입:</strong> 블랙프라이데이 세일 정보를 뉴스레터나 소셜미디어로 받기</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>이메일 알림:</strong> 각 쇼핑몰 이메일 알림 가입해 세일 정보 빠르게 받기</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Shopping Tips */}
        <div className="space-y-6 mt-6">
          <h3 className="text-lg font-bold text-foreground">똑똑한 쇼핑 실행 팁</h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                온라인 쇼핑
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 인기 제품은 빠르게 품절되므로 할인 시작 전 사이트 미리 접속</li>
                <li>• 대부분 주요 매장에서 온라인 전용 할인 혜택 제공</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">오프라인 쇼핑</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 이른 시간 방문: 인기 매장은 아침 일찍부터 붐비므로 일찍 가기</li>
                <li>• 혼잡 피하기: 오전 중반이나 오후 늦은 시간이 덜 혼잡</li>
                <li>• 매장 시간 확인: 매장별 오픈 시간이 다르므로 사전 확인 필수</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Benefits */}
        <div className="bg-card border border-border rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-500" />
            결제 혜택 활용
          </h3>
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <div className="font-medium text-green-700 dark:text-green-300 mb-1">해외직구 카드 혜택</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                최대 20만원 결제액 대해 5% 할인 (조건 충족시)
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">캐시백 사이트</div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                해외 유명 사이트 경유시 캐시백이나 적립 혜택
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Stores */}
        <div className="bg-card border border-border rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-foreground mb-3">추천 쇼핑몰</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-center">
              <div className="font-medium text-orange-700 dark:text-orange-300 text-sm">아마존</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">전자제품, 생활용품</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
              <div className="font-medium text-blue-700 dark:text-blue-300 text-sm">베스트바이</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">가전제품 특화</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-center">
              <div className="font-medium text-purple-700 dark:text-purple-300 text-sm">이베이</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">다양한 셀러 상품</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
              <div className="font-medium text-green-700 dark:text-green-300 text-sm">월마트</div>
              <div className="text-xs text-green-600 dark:text-green-400">주방 가전제품</div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">주의사항</h3>
          </div>
          <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
            <li>• 사전 계획: 철저한 사전 계획과 빠른 실행이 중요</li>
            <li>• 가격 비교: 가격 비교 사이트 통해 최저가 미리 조사</li>
            <li>• 환불 정책: 대부분 매장에서 연말 환불 정책 연장되므로 사전 확인</li>
          </ul>
        </div>

        {/* Success Tip */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mt-6">
          <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">성공의 핵심</h4>
          <p className="text-sm text-green-600 dark:text-green-400 leading-relaxed">
            <strong>사전 준비가 성공의 핵심입니다!</strong> 
            미리 원하는 상품을 조사하고, 알림을 설정하며, 필요한 정보를 준비해두면 
            최대 할인 혜택을 놓치지 않고 똑똑한 쇼핑을 할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}