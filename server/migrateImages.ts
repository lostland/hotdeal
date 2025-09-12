import Database from "@replit/database";
import { pgStorage } from './pgStorage';
import { db as drizzleDb } from './db';
import { images } from '../shared/schema';
import { eq } from 'drizzle-orm';

const replDb = new Database();

async function migrateImages() {
  try {
    console.log('🔄 ReplDB 이미지를 PostgreSQL로 마이그레이션 시작...');
    
    // ReplDB에서 모든 image_ 키 가져오기
    const result = await replDb.list("image_");
    
    // ReplDB 응답 구조 처리
    let keys: string[];
    if (result && typeof result === 'object' && 'value' in result && result.value) {
      keys = result.value as string[];
    } else {
      keys = [];
    }
    
    console.log(`📊 발견된 이미지 파일: ${keys.length}개`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const key of keys) {
      try {
        const filename = key.replace('image_', '');
        
        // ReplDB에서 이미지 데이터 가져오기
        const result = await replDb.get(key);
        let base64Data;
        
        if (result && result.ok && result.value) {
          base64Data = result.value;
        } else if (result && !result.ok) {
          console.warn(`⚠️ 이미지 데이터 없음: ${filename}`);
          skipped++;
          continue;
        } else {
          base64Data = result;
        }
        
        if (!base64Data) {
          console.warn(`⚠️ 빈 이미지 데이터: ${filename}`);
          skipped++;
          continue;
        }
        
        // Buffer로 변환
        const buffer = Buffer.from(base64Data, 'base64');
        
        // 중복 확인
        const existing = await drizzleDb.select().from(images).where(eq(images.filename, filename)).limit(1);
        if (existing.length > 0) {
          console.log(`⏭️ 이미 존재하는 이미지: ${filename}`);
          skipped++;
          continue;
        }
        
        // PostgreSQL에 저장
        try {
          await pgStorage.saveImage(buffer, filename);
          migrated++;
          console.log(`✅ 이미지 마이그레이션: ${filename} (${migrated}/${keys.length})`);
        } catch (saveError: any) {
          if (saveError.constraint === 'images_filename_unique' || saveError.message?.includes('duplicate')) {
            console.log(`⏭️ 이미 존재하는 이미지: ${filename}`);
            skipped++;
          } else {
            throw saveError;
          }
        }
        
        // 처리 속도 조절 (너무 빠르면 DB 부하)
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ 이미지 마이그레이션 실패 ${key}:`, error);
        skipped++;
      }
    }
    
    console.log(`🎉 이미지 마이그레이션 완료! 성공: ${migrated}개, 건너뜀: ${skipped}개`);
    
  } catch (error) {
    console.error('❌ 이미지 마이그레이션 전체 실패:', error);
    throw error;
  }
}

export { migrateImages };