import * as cheerio from "cheerio";



export async function fetchMetadata(url: string) {
  try {
    // Get final URL after redirects for better processing
    let finalUrl = url;
    let productCode = null;
    
    // Extract domain early for error handling
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    
    // For G마켓 redirect links, try to get the actual product URL first
    if (url.includes('link.gmarket.co.kr')) {
      try {
        // Try multiple methods to get the redirect URL
        const response = await fetch(url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': '*/*',
            'Accept-Language': 'ko-KR,ko;q=0.9',
          },
          redirect: 'follow'
        });
        
        if (response.url && response.url !== url) {
          finalUrl = response.url;
          console.log(`G마켓 리디렉트: ${url} -> ${finalUrl}`);
          
          // Extract product code from the redirected URL
          const match = finalUrl.match(/goodscode=(\d+)/);
          if (match) {
            productCode = match[1];
            console.log(`추출된 상품 코드: ${productCode}`);
          }
        }
      } catch (redirectError) {
        console.log('리디렉트 실패, 원본 URL 사용:', redirectError instanceof Error ? redirectError.message : String(redirectError));
      }
    }

    // Try multiple approaches to fetch data
    const approaches = [

      // Mobile user agents
      //'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (Linux; Android 15; SM-S911N Build/AP3A.240905.015.A2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.0.0 Whale/1.0.0.0 Crosswalk/29.128.0.15 Mobile Safari/537.36 NAVER(inapp; search; 2000; 12.14.32)',
      'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      // Korean browser patterns (more likely to be allowed)
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

    ];

    let response = null;
    let lastError = null;

    // Try each approach
    console.log(`----------------------------------------------------------`);
    console.log(`${finalUrl}`)
    for (const userAgent of approaches) {
      try {
        
        console.log(`User-Agent: ${userAgent}`);
        
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 2000)); // 2-3초 대기
        response = await fetch(finalUrl, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.google.com/',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(5000) // Shorter timeout for faster fallback
        });

        if (response.ok) {
          console.log(`성공적으로 페이지 로드: ${userAgent.slice(0, 30)}...`);
          break;
        }
        else
        {
          console.log(`페이지 로드 실패: ${response.status}`);
        }
      } catch (error) {
        lastError = error;
        console.log(`시도 실패 (${userAgent.slice(0, 30)}...):`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    if (!response || !response.ok) {
      console.log(`모든 fetch 시도 실패: HTTP ${response?.status || 'UNKNOWN'}`);
      throw new Error(`페이지 로드 실패. HTTP ${response?.status || 'UNKNOWN'}: ${response?.statusText || 'All user agents failed'}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata with more fallback options
    let title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      '';

    let description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="summary"]').attr('content') ||
      '';

    let image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href') ||
      null;

    // Update domain if we have a different finalUrl after redirect
    let finalDomain = domain;
    if (finalUrl !== url) {
      try {
        const finalUrlObj = new URL(finalUrl);
        finalDomain = finalUrlObj.hostname;
      } catch {
        // Keep original domain if parsing fails
        finalDomain = domain;
      }
    }

    
    // 디버깅 정보는 필요시에만 활성화
    console.log(`meta size = ${$('meta').length}`);
    $('meta').each((i, el) => {
      const $el = $(el);
      const name = $el.attr('name') || $el.attr('property') || $el.attr('http-equiv') || 'unknown';
      const content = $el.attr('content') || '';
      console.log(`meta[${i}]: ${name} = "${content}"`);
    });


    // Extract price information with site-specific selectors
    let price = 
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="product:price"]').attr('content') ||
      // 11번가: 먼저 메타데이터에서 가격 추출
      (finalDomain.includes('11st.co.kr') ? (
        // 메타 태그에서 가격 추출 (가장 신뢰도 높음)
        (() => {
          const ogDesc = $('meta[property="og:description"]').attr('content') || '';
          const desc = $('meta[name="description"]').attr('content') || '';
          
          // "가격 : 19,900원" 형식에서 추출
          let priceFromMeta = ogDesc.match(/가격\s*:\s*([0-9,]+원)/)?.[1] ||
                            desc.match(/가격\s*:\s*([0-9,]+원)/)?.[1] ||
                            ogDesc.match(/할인모음가:\s*([0-9,]+원)/)?.[1] ||
                            desc.match(/할인모음가:\s*([0-9,]+원)/)?.[1];
                            
          console.log(`11번가 메타데이터에서 가격 추출: "${priceFromMeta}"`);
          return priceFromMeta;
        })() ||
        // 메타데이터 추출 실패시 DOM에서 시도
        $('.prc_t .prc').first().text().trim() ||
        $('.sale_price').first().text().trim() ||
        $('.price_real').first().text().trim() ||
        $('.prd_price .price').first().text().trim() ||
        $('.total_price .price').first().text().trim() ||
        $('.selling_price').first().text().trim() ||
        $('.current_price').first().text().trim() ||
        $('.prc_price').first().text().trim() ||
        $('.c_prd_price .sale').first().text().trim() ||
        $('.price_innfo .sale_price').first().text().trim() ||
        $('.price_wrap .price').first().text().trim() ||
        $('.price_info .sale_price').first().text().trim() ||
        null
      ) : null) ||
      // G마켓 specific price selectors (more comprehensive)
      $('.item_price .price_innerwrap .price_real .price').first().text().trim() ||
      $('.item_price .discount_price').first().text().trim() ||
      $('.price_real .price').first().text().trim() ||
      $('.item_price .price').first().text().trim() ||
      $('.product-price .price').first().text().trim() ||
      $('.prc_t .prc').first().text().trim() ||
      $('.real_price').first().text().trim() ||
      $('.sale_price').first().text().trim() ||
      $('#__itemDetailForm .prc_t .prc').first().text().trim() ||
      // Additional G마켓 selectors
      $('.box_item_price .price').first().text().trim() ||
      $('[data-montelena="item_price"]').first().text().trim() ||
      $('._price').first().text().trim() ||
      $('.price_num').first().text().trim() ||
      $('.price_value').first().text().trim() ||
      // JSON-LD structured data
      $('script[type="application/ld+json"]').toArray().map(script => {
        try {
          const json = JSON.parse($(script).html() || '{}');
          if (json['@type'] === 'Product' && json.offers && json.offers.price) {
            return json.offers.price + '원';
          }
          return null;
        } catch { return null; }
      }).find(p => p) ||
      // General selectors
      $('.price').first().text().trim() ||
      $('.cost').first().text().trim() ||
      $('.sale-price').first().text().trim() ||
      $('.current-price').first().text().trim() ||
      $('[class*="price"]').first().text().trim() ||
      null;

    // Debug: Log what price we found (11번가만)
    if (finalDomain.includes('11st.co.kr')) {
      console.log(`원본 가격 데이터 (${finalDomain}): "${price}"`);
    }

    // If we don't have productCode yet, try to extract it
    if (!productCode && finalUrl.includes('gmarket.co.kr') && finalUrl.includes('goodscode=')) {
      const match = finalUrl.match(/goodscode=(\d+)/);
      if (match) {
        productCode = match[1];
        console.log(`HTML에서 추출된 상품 코드: ${productCode}`);
      }
    }

    // Use extracted title only - no fallback

    // Use extracted description only - no fallback

    // Use extracted image only - no hardcoded fallbacks
    if (!image && finalDomain.includes('gmarket') && productCode) {
      // Only for gmarket with valid product code, construct dynamic image URL
      image = `https://gdimg.gmarket.co.kr/${productCode}/still/300`;
    }

    // Ensure absolute URLs for images
    if (image && !image.startsWith('http')) {
      try {
        image = new URL(image, finalUrl).href;
      } catch {
        image = null;
      }
    }

    // Clean and validate price data
    if (price && price.trim && price.trim()) {
      // Filter out invalid price data (like inventory counts, etc.)
      const invalidPricePatterns = [
        /총\s*\d+\s*개/,      // "총 0개", "총 123개" etc.
        /총\s*이미지\s*수/,    // "총 이미지 수" etc.
        /총\s*리뷰/,          // "총 리뷰" etc.
        /총\s*\d+/,           // "총 0", "총 100" etc.
        /^\d+\s*개$/,         // "0개", "123개" etc.
        /재고/,               // "재고" related text
        /수량/,               // "수량" related text
        /품절/,               // "품절" text
        /이미지\s*수/,        // "이미지 수" 
        /리뷰\s*보기/,        // "리뷰 보기"
        /^[\s\-\+\=]+$/,      // Only symbols/spaces
        /^[가-힣\s]*\d+[가-힣\s]*$/,  // Korean text with numbers but no currency
      ];
      
      const isInvalidPrice = invalidPricePatterns.some(pattern => {
        const matches = pattern.test(price?.trim() || '');
        if (matches) {
          console.log(`패턴 "${pattern}" 매칭됨: "${price}"`);
        }
        return matches;
      });
      
      if (isInvalidPrice && !price.includes('원')) {
        console.log(`잘못된 가격 데이터 필터링: "${price}"`);
        price = null;
      } else {
        // jnmall.kr 특별 처리: %가 있으면 바로 뒤의 가격만 추출
        if (finalDomain.includes('jnmall.kr') && price.includes('%')) {
          const percentMatch = price.match(/(\d+)%([0-9,]+원)/);
          if (percentMatch) {
            price = percentMatch[2]; // % 바로 뒤의 가격만 추출
            console.log(`jnmall 할인가격 추출: "${percentMatch[0]}" -> "${price}"`);
          }
        } else {
          // Clean up price formatting
          const cleanedPrice = price.replace(/[^\d,원]/g, '').trim();
          console.log(`가격 정리: "${price}" -> "${cleanedPrice}"`);
          price = cleanedPrice;
          if (!price.includes('원') && /^\d+[,\d]*$/.test(price)) {
            price += '원';
          }
        }
      }
    }

    // Generate fallback price if none found - 가격을 찾지 못하면 null로 설정
    if (!price || !price.trim()) {
      console.log(`최종 가격 없음, null로 설정`);
      price = null;
    }

    return {
      title: title.trim().substring(0, 200) || null,
      description: description.trim().substring(0, 300) || null,
      image: image && image.startsWith('http') ? image : null,
      price: price && price.trim() ? price.trim() : null,
      domain: finalDomain
    };
  } catch (error) {
    console.error("Error fetching metadata for URL:", url, error);
    
    // Return better fallback metadata with special handling for known URLs
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    let fallbackTitle = '';
    let fallbackDescription = '';
    let fallbackImage = '';
    let fallbackPrice = null;
    let fallbackProductCode = null;
    
    // For G마켓 links, try to extract product code from either original URL or redirect
    if (domain.includes('gmarket') || url.includes('link.gmarket.co.kr')) {
      // First try to get product code from direct URL
      if (url.includes('goodscode=')) {
        const match = url.match(/goodscode=(\d+)/);
        if (match) fallbackProductCode = match[1];
      }
      
      // If it's a redirect link and we don't have product code, try one more redirect attempt
      if (!fallbackProductCode && url.includes('link.gmarket.co.kr')) {
        try {
          // Quick redirect attempt to get product code
          const redirectResponse = await fetch(url, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(5000)
          });
          
          if (redirectResponse.url && redirectResponse.url.includes('goodscode=')) {
            const match = redirectResponse.url.match(/goodscode=(\d+)/);
            if (match) {
              fallbackProductCode = match[1];
              console.log(`Fallback에서 상품 코드 추출 성공: ${fallbackProductCode}`);
            }
          }
        } catch (redirectError) {
          console.log('Fallback 리디렉트 시도 실패:', redirectError instanceof Error ? redirectError.message : String(redirectError));
        }
      }
      
      fallbackTitle = '';
      fallbackDescription = '';
      
      if (fallbackProductCode) {
        fallbackImage = `https://gdimg.gmarket.co.kr/${fallbackProductCode}/still/300`;
      } else {
        fallbackImage = '';
      }
      fallbackPrice = null;
    } else {
      fallbackTitle = '';
      fallbackDescription = '';
      fallbackImage = '';
      fallbackPrice = null;
    }
    
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      image: fallbackImage,
      price: fallbackPrice,
      domain: domain
    };
  }
}