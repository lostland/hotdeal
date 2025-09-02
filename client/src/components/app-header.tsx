import logoImage from "../assets/logo.jpg";

export function AppHeader() {
  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40" data-testid="app-header">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex justify-center">
          <img 
            src={logoImage} 
            alt="핫딜 쇼핑 로고" 
            className="h-12 w-auto object-contain"
            data-testid="logo-image"
          />
        </div>
      </div>
    </header>
  );
}
