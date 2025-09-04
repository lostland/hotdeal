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
          <KakaoShareButton className="!flex !items-center !justify-center !w-12 !h-12 !bg-yellow-400 hover:!bg-yellow-500 !rounded-full !shadow-lg !transition-all !duration-200 hover:!scale-105 !px-0 !py-0 [&>span]:!hidden" />
        </div>
      </div>
    </header>
  );
}
