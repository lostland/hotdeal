import logoImage from "../assets/logo.jpg";

export function AppHeader() {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40" data-testid="app-header">
      <div className="w-full">
        <img 
          src={logoImage} 
          alt="핫딜 쇼핑 로고" 
          className="w-full h-auto object-contain"
          data-testid="logo-image"
        />
      </div>
    </header>
  );
}
