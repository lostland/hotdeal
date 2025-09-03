import logoImage from "../assets/logo.jpg";
import { KakaoShareButton } from "./kakao-share-button";

export function AppHeader() {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40" data-testid="app-header">
      <div className="w-full flex justify-center relative">
        <img 
          src={logoImage} 
          alt="핫딜 쇼핑 로고" 
          className="w-full md:w-[70%] h-auto object-contain"
          data-testid="logo-image"
        />
        
        {/* 카카오톡 공유 버튼 - 로고 위에 겹쳐서 우측 하단에 배치 */}
        <div className="absolute bottom-2 right-2 md:right-[15%]">
          <KakaoShareButton />
        </div>
      </div>
    </header>
  );
}
