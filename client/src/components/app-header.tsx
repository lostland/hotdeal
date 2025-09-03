import logoImage from "../assets/logo.jpg";

export function AppHeader() {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40" data-testid="app-header">
      <div className="w-full flex justify-center">
        <img 
          src={logoImage} 
          alt="핫딜 쇼핑 로고" 
          className="w-full md:w-[70%] h-auto object-contain"
          data-testid="logo-image"
        />
      </div>
    </header>
  );
}
