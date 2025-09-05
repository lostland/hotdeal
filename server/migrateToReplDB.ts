const Database = require("@replit/database");
const fs = require('fs').promises;
const path = require('path');

const db = new Database();

interface FileData {
  links: any[];
  urls: string[];
}

async function migrateToReplDB() {
  try {
    console.log('ReplDB 마이그레이션 시작...');

    // 1. 링크 데이터 마이그레이션
    try {
      const linksData = await fs.readFile(path.join(process.cwd(), 'data', 'links.json'), 'utf8');
      const parsedLinksData: FileData = JSON.parse(linksData);
      
      await db.set('links_data', parsedLinksData);
      console.log(`✅ 링크 데이터 마이그레이션 완료: ${parsedLinksData.links.length}개 링크, ${parsedLinksData.urls.length}개 URL`);
    } catch (error) {
      console.log('⚠️ 링크 데이터 파일이 없거나 빈 상태입니다.');
      await db.set('links_data', { links: [], urls: [] });
    }

    // 2. 관리자 데이터 마이그레이션
    try {
      const adminData = await fs.readFile(path.join(process.cwd(), 'data', 'admin.json'), 'utf8');
      const parsedAdminData = JSON.parse(adminData);
      
      await db.set('admin_data', parsedAdminData);
      console.log(`✅ 관리자 데이터 마이그레이션 완료: ${parsedAdminData.length}개 계정`);
    } catch (error) {
      console.log('⚠️ 관리자 데이터 파일이 없습니다. 기본 계정 생성...');
      const defaultAdminData = [
        {
          username: 'admin',
          password: "$2b$10$q3bhJ2mYP.QNmRWoSTK4iuc8o9SOaVl88Er05yxLoinFJXh0AC6CG"
        },
        {
          username: 'ready',
          password: "$2b$10$CXWJj40kN/fZYmndOxo/oebQX2yDp1O.9dzRasBH64d1FHvmqU8F."
        }
      ];
      await db.set('admin_data', defaultAdminData);
    }

    // 3. 확인
    const migratedLinks = await db.get('links_data');
    const migratedAdmin = await db.get('admin_data');
    
    console.log('🎉 ReplDB 마이그레이션 완료!');
    console.log(`- 링크: ${migratedLinks?.links?.length || 0}개`);
    console.log(`- URL: ${migratedLinks?.urls?.length || 0}개`);
    console.log(`- 관리자 계정: ${migratedAdmin?.length || 0}개`);
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  }
}

// 직접 실행 시
if (require.main === module) {
  migrateToReplDB();
}

module.exports = { migrateToReplDB };