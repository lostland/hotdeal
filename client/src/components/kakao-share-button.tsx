import { useEffect } from "react";

declare global {
  interface Window {
    Kakao: any;
  }
}

interface KakaoShareButtonProps {
  className?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  note?: string;
  url?: string;
}

export function KakaoShareButton({ 
  className = "", 
  title, 
  description, 
  imageUrl, 
  price, 
  note, 
  url 
}: KakaoShareButtonProps) {
  useEffect(() => {
    // 카카오 SDK 초기화
    if (typeof window !== "undefined" && window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init("4bc0f8b8b999284e3804a39c8ddf1a2e");
    }
  }, []);

  const handleKakaoShare = () => {
    if (typeof window !== "undefined" && window.Kakao) {
      // 공유할 컨텐츠 구성
      const shareTitle = title || "핫딜! 쇼핑";
      const shareDescription = [
        note && `📋 ${note}`,
        price && `💰 ${price}`,
        description
      ].filter(Boolean).join('\n\n') || "최신 핫딜 상품을 확인해보세요!";
      
      // 이미지 URL을 절대 경로로 변환 (카카오톡 공유에서 상대 경로는 지원하지 않음)
      let shareImageUrl = imageUrl;
      if (shareImageUrl && shareImageUrl.startsWith('/')) {
        shareImageUrl = window.location.origin + shareImageUrl;
      }
      if (!shareImageUrl) {
        shareImageUrl = "https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/7339388653/B.jpg?559000000";
      }
      
      const shareUrl = url || window.location.href;

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: shareTitle,
          description: shareDescription,
          imageUrl: shareImageUrl,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "상품 보러가기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    }
  };

  return (
    <button
      onClick={handleKakaoShare}
      className={`flex items-center gap-1 px-2 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-xs font-medium text-black transition-all duration-200 hover:scale-105 ${className}`}
      title="카카오톡으로 공유하기"
      data-testid="kakao-share-button"
    >
      <svg
        width="14"
        height="14"
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
      <span>카카오 공유</span>
    </button>
  );
}