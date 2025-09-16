import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 테스트 파일 위치
  testDir: './tests',
  
  // 병렬 실행 설정
  fullyParallel: true,
  
  // CI 환경에서 실패 시 재시도 비활성화
  forbidOnly: !!process.env.CI,
  
  // 실패 시 재시도 횟수
  retries: process.env.CI ? 2 : 0,
  
  // 병렬 워커 수
  workers: process.env.CI ? 1 : undefined,
  
  // 테스트 결과 리포터
  reporter: 'html',
  
  // 모든 테스트에 공통 설정
  use: {
    // 기본 URL (로컬 개발 서버)
    baseURL: 'http://localhost:5000',
    
    // 실패 시 스크린샷 캡처
    screenshot: 'only-on-failure',
    
    // 실패 시 비디오 녹화
    video: 'retain-on-failure',
    
    // 추적 정보 수집 (실패 시에만)
    trace: 'on-first-retry',
  },

  // 다양한 브라우저 및 디바이스 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 로컬 개발 서버 설정
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
  },
});