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
      // Korean browser patterns (more likely to be allowed)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      // Mobile user agents
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    ];

    let response = null;
    let lastError = null;

    // Try each approach
    for (const userAgent of approaches) {
      try {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100)); // Shorter delay
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
      } catch (error) {
        lastError = error;
        console.log(`시도 실패 (${userAgent.slice(0, 30)}...):`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    if (!response || !response.ok) {
      // If all methods fail, create intelligent fallback based on URL analysis
      if (productCode && (domain.includes('gmarket') || url.includes('link.gmarket.co.kr'))) {
        console.log(`HTTP 에러 발생하지만 상품 코드로 fallback 생성: ${productCode}`);
        
        // 모바일 버전으로 재시도
        const mobileUrl = `https://mitem.gmarket.co.kr/Item?goodscode=${productCode}`;
        console.log(`모바일 버전으로 재시도: ${mobileUrl}`);
        
        try {
          const mobileResponse = await fetch(mobileUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            },
            signal: AbortSignal.timeout(8000)
          });
          
          if (mobileResponse.ok) {
            const mobileHtml = await mobileResponse.text();
            const mobile$ = cheerio.load(mobileHtml);
            
            // 모바일 가격 선택자들 (확장)
            const mobilePrice = 
              mobile$('.item_price .price').first().text().trim() ||
              mobile$('.price_area .price').first().text().trim() ||
              mobile$('.prc_t').first().text().trim() ||
              mobile$('.price_real').first().text().trim() ||
              mobile$('.sale_price').first().text().trim() ||
              mobile$('.discount_price').first().text().trim() ||
              mobile$('.box_price .price').first().text().trim() ||
              mobile$('[data-price]').attr('data-price') ||
              mobile$('[class*="price"]').first().text().trim() ||
              // JSON-LD 모바일에서도 시도
              mobile$('script[type="application/ld+json"]').toArray().map(script => {
                try {
                  const json = JSON.parse(mobile$(script).html() || '{}');
                  if (json['@type'] === 'Product' && json.offers && json.offers.price) {
                    return json.offers.price + '원';
                  }
                  return null;
                } catch { return null; }
              }).find(p => p) ||
              null;
            
            if (mobilePrice) {
              console.log(`모바일에서 가격 추출 성공: ${mobilePrice}`);
              return {
                title: 'G마켓 상품',
                description: 'G마켓에서 판매하는 상품입니다.',
                image: `https://gdimg.gmarket.co.kr/${productCode}/still/300`,
                price: mobilePrice,
                domain: domain.includes('gmarket') ? domain : 'item.gmarket.co.kr'
              };
            }
          }
        } catch (mobileError) {
          console.log(`모바일 버전도 실패: ${mobileError instanceof Error ? mobileError.message : String(mobileError)}`);
        }
        
        return {
          title: 'G마켓 상품',
          description: 'G마켓에서 판매하는 상품입니다.',
          image: `https://gdimg.gmarket.co.kr/${productCode}/still/300`,
          price: null,
          domain: domain.includes('gmarket') ? domain : 'item.gmarket.co.kr'
        };
      }
      throw new Error(`모든 시도 실패. HTTP ${response?.status || 'UNKNOWN'}: ${response?.statusText || 'All user agents failed'}`);
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

    // Extract price information with site-specific selectors
    let price = 
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="product:price"]').attr('content') ||
      // 11번가 specific price selectors (더 구체적으로)
      (finalDomain.includes('11st.co.kr') ? (
        // 가격정보 섹션에서 직접 추출
        $('div:contains("가격정보")').next().text().trim() ||
        $('.prc_price').first().text().trim() ||
        $('.sale_price .value').first().text().trim() ||
        $('.sale_price').first().text().trim() ||
        $('.price_innfo .sale_price').first().text().trim() ||
        $('.total_price .price').first().text().trim() ||
        $('.c_prd_price .sale').first().text().trim() ||
        $('.prd_price_info .sale_price').first().text().trim() ||
        $('.price_area .sale_price').first().text().trim() ||
        $('.prd_price .price_sale').first().text().trim() ||
        $('.sellprice').first().text().trim() ||
        $('[data-log-actionid-label="price"]').first().text().trim() ||
        // 더 포괄적인 선택자 (하지만 필터링 강화로 잘못된 데이터는 걸러냄)
        $('*:contains("원")').filter((i, el) => {
          const text = $(el).text().trim();
          return /\d+[,\d]*원/.test(text) && !text.includes('총') && !text.includes('이미지') && !text.includes('리뷰');
        }).first().text().trim() ||
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

    // Debug: Log what price we found
    console.log(`원본 가격 데이터 (${finalDomain}): "${price}"`);

    // If we don't have productCode yet, try to extract it
    if (!productCode && finalUrl.includes('gmarket.co.kr') && finalUrl.includes('goodscode=')) {
      const match = finalUrl.match(/goodscode=(\d+)/);
      if (match) {
        productCode = match[1];
        console.log(`HTML에서 추출된 상품 코드: ${productCode}`);
      }
    }

    // Generate better fallback title if none found
    if (!title.trim()) {
      if (domain.includes('naver')) {
        title = '네이버 쇼핑 상품';
      } else if (domain.includes('kakao')) {
        title = '카카오 쇼핑 상품';
      } else if (domain.includes('gmarket')) {
        title = 'G마켓 상품';
      } else {
        title = `${domain} 페이지`;
      }
    }

    // Generate better fallback description
    if (!description.trim()) {
      if (domain.includes('naver')) {
        description = '네이버 쇼핑에서 판매하는 상품입니다.';
      } else if (domain.includes('kakao')) {
        description = '카카오 쇼핑에서 판매하는 상품입니다.';
      } else if (domain.includes('gmarket')) {
        description = 'G마켓에서 판매하는 상품입니다.';
      } else {
        description = `${domain}의 페이지입니다.`;
      }
    }

    // Use a default placeholder image for Korean shopping sites if no image found
    if (!image) {
      if (finalDomain.includes('naver')) {
        image = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      } else if (finalDomain.includes('kakao')) {
        image = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      } else if (finalDomain.includes('gmarket')) {
        if (productCode) {
          // Try to construct product image URL for G마켓 products
          image = `https://gdimg.gmarket.co.kr/${productCode}/still/300`;
        } else {
          image = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
        }
      } else {
        image = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      }
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
      
      if (isInvalidPrice) {
        console.log(`잘못된 가격 데이터 필터링: "${price}"`);
        price = null;
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

    // Generate fallback price if none found - 가격을 찾지 못하면 null로 설정
    if (!price || !price.trim()) {
      console.log(`최종 가격 없음, null로 설정`);
      price = null;
    }

    return {
      title: title.trim().substring(0, 200) || `${finalDomain} 페이지`,
      description: description.trim().substring(0, 300) || `${finalDomain}의 페이지입니다.`,
      image: image && image.startsWith('http') ? image : 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
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
      
      fallbackTitle = 'G마켓 상품';
      fallbackDescription = 'G마켓에서 판매하는 상품입니다.';
      
      if (fallbackProductCode) {
        fallbackImage = `https://gdimg.gmarket.co.kr/${fallbackProductCode}/still/300`;
      } else {
        fallbackImage = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      }
      fallbackPrice = null;
    } else if (domain.includes('naver')) {
      fallbackTitle = '네이버 쇼핑 상품';
      fallbackDescription = '네이버 쇼핑에서 판매하는 상품입니다.';
      fallbackImage = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      fallbackPrice = null;
    } else if (domain.includes('kakao')) {
      fallbackTitle = '카카오 쇼핑 상품';
      fallbackDescription = '카카오 쇼핑에서 판매하는 상품입니다.';
      fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      fallbackPrice = null;
    } else {
      fallbackTitle = `${domain} 페이지`;
      fallbackDescription = `${domain}의 페이지입니다.`;
      fallbackImage = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
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