import { db } from "./db";
import { links, users, statistics, type Link, type InsertLink, type User, type InsertUser, type Statistics, type InsertStatistics } from "@shared/schema";
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
        // 기본 관리자 계정들 생성
        const defaultAdmins = [
          { username: 'admin', password: 'semicom11' },
          { username: 'ready', password: 'ready123' }
        ];

        for (const admin of defaultAdmins) {
          const hashedPassword = await bcrypt.hash(admin.password, 10);
          await db.insert(users).values({
            username: admin.username,
            password: hashedPassword
          });
        }
        console.log('기본 관리자 계정 생성 완료');
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
}

export const pgStorage = new PgStorage();