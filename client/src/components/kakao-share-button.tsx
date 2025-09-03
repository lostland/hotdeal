import { useEffect } from "react";

declare global {
  interface Window {
    Kakao: any;
  }
}

interface KakaoShareButtonProps {
  className?: string;
}

export function KakaoShareButton({ className = "" }: KakaoShareButtonProps) {
  useEffect(() => {
    // 카카오 SDK 초기화
    if (typeof window !== "undefined" && window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init("4bc0f8b8b999284e3804a39c8ddf1a2e");
    }
  }, []);

  const handleKakaoShare = () => {
    if (typeof window !== "undefined" && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "핫딜! 쇼핑",
          description: "최신 핫딜 상품들을 확인해보세요! 실시간 가격 정보와 할인 정보를 제공합니다.",
          imageUrl: "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/7339388653/B.jpg?559000000",
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: "핫딜 보러가기",
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    }
  };

  return (
    <button
      onClick={handleKakaoShare}
      className={`flex items-center justify-center w-12 h-12 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${className}`}
      title="카카오톡으로 공유하기"
      data-testid="kakao-share-button"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-black"
      >
        <path
          d="M12 3C6.486 3 2 6.262 2 10.5c0 2.665 1.693 5.006 4.273 6.412l-.865 3.176a.5.5 0 0 0 .766.576L9.93 18.5c.69.093 1.397.14 2.07.14 5.514 0 10-3.262 10-7.5S17.514 3 12 3z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}