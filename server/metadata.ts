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
        return {
          title: 'G마켓 상품',
          description: 'G마켓에서 판매하는 상품입니다.',
          image: `https://gdimg.gmarket.co.kr/${productCode}/still/300`,
          price: '가격 확인',
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

    // Extract price information
    let price = 
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="product:price"]').attr('content') ||
      $('.price').first().text().trim() ||
      $('.cost').first().text().trim() ||
      $('.sale-price').first().text().trim() ||
      $('.current-price').first().text().trim() ||
      $('[class*="price"]').first().text().trim() ||
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

    // Generate fallback price if none found
    if (!price || !price.trim()) {
      if (finalDomain.includes('gmarket') || finalDomain.includes('naver') || finalDomain.includes('kakao')) {
        price = '가격 확인';
      } else {
        price = null;
      }
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
      fallbackPrice = '가격 확인';
    } else if (domain.includes('naver')) {
      fallbackTitle = '네이버 쇼핑 상품';
      fallbackDescription = '네이버 쇼핑에서 판매하는 상품입니다.';
      fallbackImage = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      fallbackPrice = '가격 확인';
    } else if (domain.includes('kakao')) {
      fallbackTitle = '카카오 쇼핑 상품';
      fallbackDescription = '카카오 쇼핑에서 판매하는 상품입니다.';
      fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      fallbackPrice = '가격 확인';
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