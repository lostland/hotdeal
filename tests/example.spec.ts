import { test, expect } from '@playwright/test';

test.describe('쇼핑딜 플랫폼 테스트', () => {
  test('홈페이지 로드 확인', async ({ page }) => {
    // 홈페이지 방문
    await page.goto('/');
    
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/쇼핑딜/);
    
    // 링크 카드들이 표시되는지 확인
    await expect(page.locator('[data-testid*="card-"]')).toBeVisible();
  });

  test('관리자 로그인 페이지', async ({ page }) => {
    // 관리자 페이지 방문
    await page.goto('/admin');
    
    // 로그인 폼 확인
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('반응형 디자인 확인', async ({ page }) => {
    // 모바일 화면 크기로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 홈페이지 방문
    await page.goto('/');
    
    // 모바일에서도 링크 카드가 정상 표시되는지 확인
    await expect(page.locator('[data-testid*="card-"]')).toBeVisible();
    
    // 네비게이션이 모바일에 맞게 표시되는지 확인
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
  });

  test('링크 공유 기능', async ({ page }) => {
    await page.goto('/');
    
    // 첫 번째 링크 카드 찾기
    const firstCard = page.locator('[data-testid*="card-"]').first();
    await expect(firstCard).toBeVisible();
    
    // 공유 버튼이 있는지 확인
    const shareButton = firstCard.locator('[data-testid*="button-share"]');
    if (await shareButton.isVisible()) {
      await shareButton.click();
      
      // 공유 대화상자나 기능이 작동하는지 확인
      // (실제 구현에 따라 조정 필요)
    }
  });
});

test.describe('관리자 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 로그인
    await page.goto('/admin');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'semicom11');
    await page.click('button[type="submit"]');
    
    // 로그인 성공 확인
    await expect(page.locator('text=관리자')).toBeVisible();
  });

  test('새 링크 추가', async ({ page }) => {
    // URL 입력 필드 찾기
    const urlInput = page.locator('input[placeholder*="URL"]');
    await expect(urlInput).toBeVisible();
    
    // 테스트 URL 입력
    await urlInput.fill('https://example.com');
    
    // 저장 버튼 클릭
    await page.click('button[data-testid="button-save"]');
    
    // 성공 메시지나 새 링크 확인
    await expect(page.locator('text=저장')).toBeVisible();
  });

  test('링크 수정', async ({ page }) => {
    // 첫 번째 링크의 수정 버튼 클릭
    const editButton = page.locator('[data-testid*="button-edit"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // 수정 폼이 나타나는지 확인
      await expect(page.locator('input[placeholder*="제목"]')).toBeVisible();
      await expect(page.locator('textarea[placeholder*="참고사항"]')).toBeVisible();
    }
  });
});

test.describe('모바일 사용자 경험', () => {
  test.use({ 
    ...devices['iPhone 12'],
  });

  test('모바일에서 링크 터치', async ({ page }) => {
    await page.goto('/');
    
    // 첫 번째 링크 카드를 터치
    const firstCard = page.locator('[data-testid*="card-"]').first();
    await expect(firstCard).toBeVisible();
    
    // 터치 이벤트 시뮬레이션
    await firstCard.tap();
    
    // 새 탭이 열리거나 페이지가 이동하는지 확인
    // (실제 동작에 따라 조정 필요)
  });
});

// 성능 테스트 예제
test.describe('성능 테스트', () => {
  test('페이지 로딩 시간', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 3초 이내 로딩 확인
    expect(loadTime).toBeLessThan(3000);
  });
});

// 접근성 테스트 예제
test.describe('접근성 테스트', () => {
  test('키보드 내비게이션', async ({ page }) => {
    await page.goto('/');
    
    // Tab 키로 이동 가능한지 확인
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Enter 키로 활성화 가능한지 확인
    await page.keyboard.press('Enter');
  });
});