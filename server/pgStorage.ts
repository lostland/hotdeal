import { db } from "./db";
import { links, users, statistics, images, type Link, type InsertLink, type User, type InsertUser, type Statistics, type InsertStatistics, type Image, type InsertImage } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { fetchMetadata } from "./metadata";
import bcrypt from "bcrypt";

export interface FileData {
  links: Link[];
  urls: string[];
}

export class PgStorage {
  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // 기본 통계 데이터 확인/생성
      await this.initializeStats();
      // 기본 관리자 계정 확인/생성
      await this.initializeAdminAccounts();
      console.log('PostgreSQL 스토리지 초기화 완료');
    } catch (error) {
      console.error('PostgreSQL 스토리지 초기화 실패:', error);
    }
  }

  private async initializeStats() {
    try {
      const existing = await db.select().from(statistics).limit(1);
      if (existing.length === 0) {
        await db.insert(statistics).values({
          id: 'global',
          visitorCount: 0,
          shareCount: 0
        });
      }
    } catch (error) {
      console.error('통계 초기화 실패:', error);
    }
  }

  private async initializeAdminAccounts() {
    try {
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length === 0) {
        // 환경변수에서 관리자 계정 정보 확인
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (adminUsername && adminPassword) {
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          await db.insert(users).values({
            username: adminUsername,
            password: hashedPassword
          });
          console.log('관리자 계정 생성 완료:', adminUsername);
        } else {
          console.log('⚠️  관리자 계정을 생성하려면 ADMIN_USERNAME과 ADMIN_PASSWORD 환경변수를 설정하세요.');
          console.log('   예: ADMIN_USERNAME=admin ADMIN_PASSWORD=your_secure_password');
        }
      }
    } catch (error) {
      console.error('관리자 계정 초기화 실패:', error);
    }
  }

  // Links 관련 메서드들
  async getAllLinks(): Promise<Link[]> {
    try {
      const result = await db.select().from(links).orderBy(desc(links.createdAt));
      return result;
    } catch (error) {
      console.error('링크 조회 실패:', error);
      return [];
    }
  }

  async addLink(linkData: InsertLink): Promise<Link> {
    try {
      // URL로 메타데이터 자동 추출
      let metadata = null;
      if (linkData.url) {
        try {
          metadata = await fetchMetadata(linkData.url);
        } catch (metaError) {
          console.warn('메타데이터 추출 실패:', metaError);
        }
      }

      const newLink: InsertLink = {
        url: linkData.url,
        title: linkData.title || metadata?.title || '',
        description: linkData.description || metadata?.description || '',
        image: linkData.image || metadata?.image || '',
        customImage: linkData.customImage || null,
        domain: linkData.domain || metadata?.domain || '',
        price: linkData.price || metadata?.price || '',
        note: linkData.note || ''
      };

      const [insertedLink] = await db.insert(links).values(newLink).returning();
      return insertedLink;
    } catch (error) {
      console.error('링크 추가 실패:', error);
      throw error;
    }
  }

  async updateLink(id: string, linkData: Partial<InsertLink>): Promise<Link | null> {
    try {
      const [updatedLink] = await db
        .update(links)
        .set(linkData)
        .where(eq(links.id, id))
        .returning();
      
      return updatedLink || null;
    } catch (error) {
      console.error('링크 업데이트 실패:', error);
      return null;
    }
  }

  async deleteLink(id: string): Promise<boolean> {
    try {
      const result = await db.delete(links).where(eq(links.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('링크 삭제 실패:', error);
      return false;
    }
  }

  async getLinkById(id: string): Promise<Link | null> {
    try {
      const [link] = await db.select().from(links).where(eq(links.id, id)).limit(1);
      return link || null;
    } catch (error) {
      console.error('링크 조회 실패:', error);
      return null;
    }
  }

  // 중복 URL 확인
  async isDuplicateUrl(url: string): Promise<boolean> {
    try {
      const [existing] = await db.select().from(links).where(eq(links.url, url)).limit(1);
      return !!existing;
    } catch (error) {
      console.error('중복 URL 확인 실패:', error);
      return false;
    }
  }

  // Statistics 관련 메서드들
  async getStats(): Promise<Statistics> {
    try {
      const [stats] = await db.select().from(statistics).limit(1);
      if (!stats) {
        // 기본 통계 생성
        const defaultStats = { id: 'global', visitorCount: 0, shareCount: 0 };
        const [newStats] = await db.insert(statistics).values(defaultStats).returning();
        return newStats;
      }
      return stats;
    } catch (error) {
      console.error('통계 조회 실패:', error);
      return { id: 'global', visitorCount: 0, shareCount: 0, updatedAt: new Date() };
    }
  }

  async incrementVisitorCount(): Promise<Statistics> {
    try {
      // 현재 값을 먼저 가져온 후 증가
      const current = await this.getStats();
      const [updatedStats] = await db
        .update(statistics)
        .set({ 
          visitorCount: current.visitorCount + 1,
          updatedAt: new Date()
        })
        .returning();
      
      return updatedStats;
    } catch (error) {
      console.error('방문자 수 증가 실패:', error);
      throw error;
    }
  }

  async incrementShareCount(): Promise<Statistics> {
    try {
      // 현재 값을 먼저 가져온 후 증가
      const current = await this.getStats();
      const [updatedStats] = await db
        .update(statistics)
        .set({ 
          shareCount: current.shareCount + 1,
          updatedAt: new Date()
        })
        .returning();
      
      return updatedStats;
    } catch (error) {
      console.error('공유 수 증가 실패:', error);
      throw error;
    }
  }

  // User/Admin 관련 메서드들
  async findUserByUsername(username: string): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return user || null;
    } catch (error) {
      console.error('사용자 조회 실패:', error);
      return null;
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('비밀번호 검증 실패:', error);
      return false;
    }
  }

  // ReplDB 호환성을 위한 메서드들 (마이그레이션용)
  async migrateFromReplDB(linksData: Link[], adminData: any[]): Promise<void> {
    try {
      console.log(`PostgreSQL로 데이터 마이그레이션 시작: ${linksData.length}개 링크`);
      
      // 링크 데이터 마이그레이션
      if (linksData.length > 0) {
        // 기존 링크 데이터 확인
        const existingLinks = await db.select().from(links).limit(1);
        
        if (existingLinks.length === 0) {
          // 링크 데이터 배치 삽입
          for (const link of linksData) {
            const linkToInsert = {
              id: link.id,
              url: link.url,
              title: link.title,
              description: link.description,
              image: link.image,
              customImage: link.customImage,
              domain: link.domain,
              price: link.price,
              note: link.note
            };
            
            await db.insert(links).values(linkToInsert);
          }
          console.log(`✅ ${linksData.length}개 링크 마이그레이션 완료`);
        }
      }

      console.log('PostgreSQL 마이그레이션 완료');
    } catch (error) {
      console.error('PostgreSQL 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 이미지 저장 (PostgreSQL에 base64로 저장)
  async saveImage(buffer: Buffer, filename: string): Promise<string> {
    try {
      const base64Data = buffer.toString('base64');
      await db.insert(images).values({
        filename,
        buffer: base64Data,
      });
      return `/api/images/${filename}`;
    } catch (error) {
      console.error('Failed to save image to PostgreSQL:', error);
      throw error;
    }
  }

  // 이미지 불러오기
  async getImage(filename: string): Promise<Buffer | null> {
    try {
      const result = await db.select().from(images).where(eq(images.filename, filename)).limit(1);
      if (result.length === 0) return null;
      
      const base64Data = result[0].buffer;
      return Buffer.from(base64Data, 'base64');
    } catch (error) {
      console.error('Failed to get image from PostgreSQL:', error);
      return null;
    }
  }

  // URL 목록 가져오기 (관리자용)
  async getUrls(): Promise<string[]> {
    try {
      const result = await db.select({ url: links.url }).from(links);
      return result.map(row => row.url);
    } catch (error) {
      console.error('Failed to get URLs from PostgreSQL:', error);
      return [];
    }
  }

  // Routes.ts 호환 메서드들 (URL 기반 인터페이스)
  async addUrl(url: string, note?: string, customImage?: string): Promise<Link> {
    const linkData: InsertLink = {
      url,
      note: note || '',
      customImage: customImage || null,
      title: '',
      description: '',
      image: '',
      domain: '',
      price: ''
    };
    return await this.addLink(linkData);
  }

  async updateUrl(oldUrl: string, newUrl: string, title?: string, note?: string, customImage?: string): Promise<Link | null> {
    try {
      const [existingLink] = await db.select().from(links).where(eq(links.url, oldUrl)).limit(1);
      if (!existingLink) return null;
      
      // 저장 버튼 누를 때마다 항상 메타데이터 다시 파싱
      try {
        const { fetchMetadata } = await import('./metadata');
        const metadata = await fetchMetadata(newUrl);
        
        const updateData: Partial<InsertLink> = {
          url: newUrl,
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
          domain: metadata.domain,
          price: metadata.price,
          customImage: customImage || null,
          note: note || ''
        };
        
        return await this.updateLink(existingLink.id, updateData);
      } catch (error) {
        console.error(`Failed to fetch metadata for ${newUrl}:`, error);
        // 메타데이터 파싱 실패시 기본 데이터로 업데이트
        try {
          const urlObj = new URL(newUrl);
          const domain = urlObj.hostname;
          
          const updateData: Partial<InsertLink> = {
            url: newUrl,
            title: title || domain,
            description: '',
            image: '',
            domain: domain,
            price: '',
            customImage: customImage || null,
            note: note || ''
          };
          
          return await this.updateLink(existingLink.id, updateData);
        } catch (urlError) {
          // URL 파싱도 실패시 기본값으로 업데이트
          const updateData: Partial<InsertLink> = {
            url: newUrl,
            title: title || '제목 없음',
            description: '',
            image: '',
            domain: '',
            price: '',
            customImage: customImage || null,
            note: note || ''
          };
          
          return await this.updateLink(existingLink.id, updateData);
        }
      }
    } catch (error) {
      console.error('URL 업데이트 실패:', error);
      return null;
    }
  }

  async removeUrl(url: string): Promise<boolean> {
    try {
      const [existingLink] = await db.select().from(links).where(eq(links.url, url)).limit(1);
      if (!existingLink) return false;
      
      return await this.deleteLink(existingLink.id);
    } catch (error) {
      console.error('URL 삭제 실패:', error);
      return false;
    }
  }

  async updateLinkMetadata(linkId: string, metadata: any): Promise<boolean> {
    try {
      const updateData: Partial<InsertLink> = {};
      if (metadata.title) updateData.title = metadata.title;
      if (metadata.description) updateData.description = metadata.description;
      if (metadata.image) updateData.image = metadata.image;
      if (metadata.domain) updateData.domain = metadata.domain;
      if (metadata.price) updateData.price = metadata.price;
      
      const result = await this.updateLink(linkId, updateData);
      return !!result;
    } catch (error) {
      console.error('링크 메타데이터 업데이트 실패:', error);
      return false;
    }
  }

  // 관리자 인증 메서드들
  async verifyAdmin(username: string, password: string): Promise<boolean> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (!user) return false;
      
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('관리자 인증 실패:', error);
      return false;
    }
  }

  async changeAdminPassword(username: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      // 기존 비밀번호 확인
      const isValid = await this.verifyAdmin(username, oldPassword);
      if (!isValid) return false;
      
      // 새 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const result = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, username));
        
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      return false;
    }
  }

  // 백업/복원 메서드들
  async getBackupData(): Promise<any> {
    try {
      const allLinks = await this.getAllLinks();
      const urls = allLinks.map(link => link.url);
      return {
        links: allLinks,
        urls: urls
      };
    } catch (error) {
      console.error('백업 데이터 조회 실패:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupData: any): Promise<void> {
    try {
      if (!backupData || !backupData.links) {
        throw new Error('유효하지 않은 백업 데이터');
      }
      
      // 기존 데이터 삭제
      await db.delete(links);
      
      // 백업 데이터 복원 (원본 시간 보존)
      for (const link of backupData.links) {
        const linkToInsert = {
          url: link.url,
          title: link.title || '',
          description: link.description || '',
          image: link.image || '',
          customImage: link.customImage || null,
          domain: link.domain || '',
          price: link.price || '',
          note: link.note || '',
          createdAt: link.createdAt ? new Date(link.createdAt) : new Date() // 원본 생성시간 보존
        };
        await db.insert(links).values(linkToInsert);
      }
      
      console.log(`백업 복원 완료: ${backupData.links.length}개 링크`);
    } catch (error) {
      console.error('백업 복원 실패:', error);
      throw error;
    }
  }
}

export const pgStorage = new PgStorage();