import Database from "@replit/database";
import { pgStorage } from "./pgStorage";

const replDB = new Database();

async function migrateToPg() {
  try {
    console.log('🔄 ReplDB에서 PostgreSQL로 데이터 마이그레이션 시작...');
    
    // ReplDB에서 링크 데이터 가져오기
    const rawLinksData = await replDB.get('links_data');
    console.log('ReplDB 원시 데이터 형태:', typeof rawLinksData, Object.keys(rawLinksData || {}));
    
    // ReplDB 데이터 형태 처리: { ok: true, value: { links: [...] } } 또는 직접 { links: [...] }
    const linksData = rawLinksData?.ok ? rawLinksData.value : rawLinksData;
    console.log('링크 데이터 처리 후:', linksData ? Object.keys(linksData) : null);
    
    if (linksData && linksData.links && Array.isArray(linksData.links)) {
      console.log(`📊 ${linksData.links.length}개 링크 발견`);
      
      // PostgreSQL에 기존 데이터가 있는지 확인
      const existingLinks = await pgStorage.getAllLinks();
      console.log(`📊 PostgreSQL에 기존 링크: ${existingLinks.length}개`);
      
      // 완전 마이그레이션: ReplDB 개수가 더 많으면 계속 진행
      if (linksData.links.length > existingLinks.length) {
        console.log(`🔄 링크 데이터 마이그레이션 시작... (ReplDB: ${linksData.links.length}개, PostgreSQL: ${existingLinks.length}개)`);
        
        let migrated = 0;
        let skipped = 0;
        
        for (const link of linksData.links) {
          try {
            // URL 기준으로 중복 확인
            const exists = await pgStorage.isDuplicateUrl(link.url);
            if (exists) {
              skipped++;
              continue;
            }
            
            // ReplDB 형식을 PostgreSQL 형식으로 변환
            const linkToMigrate = {
              url: link.url,
              title: link.title || '',
              description: link.description || '',
              image: link.image || '',
              customImage: link.customImage || null,
              domain: link.domain || '',
              price: link.price || '',
              note: link.note || ''
            };
            
            await pgStorage.addLink(linkToMigrate);
            migrated++;
            console.log(`✅ [${migrated}/${linksData.links.length}] 마이그레이션: ${link.title || link.url}`);
            
            // Rate limiting 방지 (100ms 대기)
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`❌ 링크 마이그레이션 실패: ${link.url}`, error);
          }
        }
        
        console.log(`🎉 마이그레이션 완료! 신규: ${migrated}개, 중복 건너뜀: ${skipped}개`);
      } else if (existingLinks.length >= linksData.links.length) {
        console.log(`✅ PostgreSQL에 충분한 데이터 존재 (${existingLinks.length}개 >= ${linksData.links.length}개)`);
      } else {
        console.log('ℹ️  마이그레이션할 링크 데이터가 없음');
      }
    } else {
      console.log('ℹ️  ReplDB에 링크 데이터가 없거나 형식이 올바르지 않음');
    }

    // 통계 데이터 마이그레이션 확인
    const stats = await pgStorage.getStats();
    console.log('📈 PostgreSQL 통계:', stats);
    
    console.log('🎉 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  }
}


export { migrateToPg };