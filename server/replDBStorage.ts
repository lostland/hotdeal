import Database from "@replit/database";
import { type Link, type InsertLink } from "@shared/schema";
import { randomUUID } from "crypto";
import { fetchMetadata } from "./metadata";
import fs from 'fs/promises';
import path from 'path';

const db = new Database();

export interface FileData {
  links: Link[];
  urls: string[];
}

export class ReplDBStorage {
  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // 마이그레이션: 기존 파일 데이터가 있으면 ReplDB로 이동
      await this.migrateFromFiles();
      console.log('ReplDB 스토리지 초기화 완료');
    } catch (error) {
      console.error('ReplDB 스토리지 초기화 실패:', error);
    }
  }

  private async migrateFromFiles() {
    try {
      // 링크 데이터 마이그레이션
      const linksDataPath = path.join(process.cwd(), 'data', 'links.json');
      try {
        const linksData = await fs.readFile(linksDataPath, 'utf8');
        const parsedLinksData: FileData = JSON.parse(linksData);
        
        // ReplDB에 기존 데이터가 없을 때만 마이그레이션
        const existingData = await db.get('links_data');
        if (!existingData) {
          // 날짜 객체 복원
          if (parsedLinksData?.links) {
            parsedLinksData.links = parsedLinksData.links.map(link => ({
              ...link,
              createdAt: new Date(link.createdAt!)
            }));
          }
          
          await db.set('links_data', parsedLinksData);
          console.log(`✅ 링크 데이터 마이그레이션 완료: ${parsedLinksData.links.length}개 링크`);
        }
      } catch (error) {
        // 파일이 없으면 빈 데이터로 시작
        const existingData = await db.get('links_data');
        if (!existingData) {
          await db.set('links_data', { links: [], urls: [] });
        }
      }

      // 관리자 데이터 마이그레이션
      const adminDataPath = path.join(process.cwd(), 'data', 'admin.json');
      try {
        const adminData = await fs.readFile(adminDataPath, 'utf8');
        const parsedAdminData = JSON.parse(adminData);
        
        const existingAdminData = await db.get('admin_data');
        if (!existingAdminData) {
          await db.set('admin_data', parsedAdminData);
          console.log(`✅ 관리자 데이터 마이그레이션 완료: ${parsedAdminData.length}개 계정`);
        }
      } catch (error) {
        // 기본 관리자 계정 생성
        const existingAdminData = await db.get('admin_data');
        if (!existingAdminData || !existingAdminData.ok) {
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
          console.log('✅ 기본 관리자 계정 생성 완료');
        }
      }
    } catch (error) {
      console.error('마이그레이션 실패:', error);
    }
  }

  private async readLinksData(): Promise<FileData> {
    try {
      const result = await db.get('links_data');
      
      // ReplDB 응답 구조 처리
      let data;
      if (result && result.ok && result.value) {
        data = result.value;
      } else if (result && !result.ok) {
        data = null;
      } else {
        data = result;
      }
      
      if (!data) {
        return { urls: [], links: [] };
      }
      
      // 기본값 보장
      const safeData: FileData = {
        urls: data.urls || [],
        links: data.links || []
      };
      
      // 날짜 객체 복원
      if (safeData.links && Array.isArray(safeData.links)) {
        safeData.links = safeData.links.map((link: any) => ({
          ...link,
          createdAt: new Date(link.createdAt)
        }));
      }
      
      return safeData;
    } catch (error) {
      console.error('Failed to read links data from ReplDB:', error);
      return { urls: [], links: [] };
    }
  }

  private async saveLinksData(data: FileData): Promise<boolean> {
    try {
      await db.set('links_data', data);
      return true;
    } catch (error) {
      console.error('Failed to save links data to ReplDB:', error);
      return false;
    }
  }

  private getFallbackData(url: string, domain: string) {
    if (domain.includes('naver')) {
      return {
        title: '네이버 쇼핑 상품',
        description: '네이버 쇼핑에서 판매하는 상품입니다.',
        image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
        price: null,
        domain: domain
      };
    } else if (domain.includes('kakao')) {
      return {
        title: '카카오 쇼핑 상품',
        description: '카카오 쇼핑에서 판매하는 상품입니다.',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
        price: null,
        domain: domain
      };
    } else if (domain.includes('gmarket')) {
      return {
        title: 'G마켓 상품',
        description: 'G마켓에서 판매하는 상품입니다.',
        image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
        price: null,
        domain: domain
      };
    } else {
      return {
        title: `${domain} 페이지`,
        description: `${domain}의 페이지입니다.`,
        image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
        price: null,
        domain: domain
      };
    }
  }

  async getAllLinks(): Promise<Link[]> {
    const data = await this.readLinksData();
    if (!data.links || !Array.isArray(data.links)) {
      return [];
    }
    return data.links.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async addUrl(url: string, note?: string | null, customImage?: string | null): Promise<Link> {
    const data = await this.readLinksData();

    // URL 중복 체크
    if (data.urls.includes(url)) {
      throw new Error('URL already exists');
    }

    // URL 추가
    data.urls.push(url);

    // 메타데이터 가져와서 링크 생성
    try {
      const metadata = await fetchMetadata(url);
      const link: Link = {
        id: randomUUID(),
        url,
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        customImage: customImage || null,
        domain: metadata.domain,
        price: metadata.price,
        note: note || null,
        createdAt: new Date()
      };
      data.links.push(link);
      await this.saveLinksData(data);
      return link;
    } catch (error) {
      console.error(`Failed to fetch metadata for ${url}:`, error);
      // Fallback data
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const fallbackData = this.getFallbackData(url, domain);
      
      const link: Link = {
        id: randomUUID(),
        url,
        ...fallbackData,
        customImage: customImage || null,
        note: note || null,
        createdAt: new Date()
      };
      data.links.push(link);
      await this.saveLinksData(data);
      return link;
    }
  }

  async removeUrl(url: string): Promise<boolean> {
    const data = await this.readLinksData();

    const urlIndex = data.urls.indexOf(url);
    if (urlIndex === -1) return false;

    // URL과 해당 링크 모두 제거
    data.urls.splice(urlIndex, 1);
    data.links = data.links.filter(link => link.url !== url);
    
    await this.saveLinksData(data);
    return true;
  }

  async getUrls(): Promise<string[]> {
    const data = await this.readLinksData();
    return data.urls || [];
  }

  async updateUrl(oldUrl: string, newUrl: string, title?: string | null, note?: string | null, customImage?: string | null): Promise<Link> {
    const data = await this.readLinksData();

    // 기존 URL이 존재하는지 확인
    const oldUrlIndex = data.urls.indexOf(oldUrl);
    if (oldUrlIndex === -1) {
      throw new Error('Original URL not found');
    }

    // 새 URL이 다르면서 이미 존재하는지 확인 (빈 URL은 제외)
    if (oldUrl !== newUrl && newUrl.trim() !== '' && data.urls.includes(newUrl)) {
      throw new Error('New URL already exists');
    }

    // URL 업데이트
    data.urls[oldUrlIndex] = newUrl;

    // 기존 링크 찾기
    const linkIndex = data.links.findIndex(link => link.url === oldUrl);
    if (linkIndex === -1) {
      throw new Error('Link not found');
    }

    // URL이 변경된 경우 새로운 메타데이터 가져오기
    if (oldUrl !== newUrl) {
      // 빈 URL이거나 유효하지 않은 URL인 경우
      if (!newUrl.trim()) {
        data.links[linkIndex] = {
          ...data.links[linkIndex],
          url: newUrl,
          title: title || "빈 링크",
          description: "URL이 설정되지 않은 링크입니다.",
          image: null,
          customImage: customImage || null,
          domain: "",
          price: null,
          note: note || null
        };
      } else {
        try {
          const metadata = await fetchMetadata(newUrl);
          data.links[linkIndex] = {
            ...data.links[linkIndex],
            url: newUrl,
            title: title || metadata.title,
            description: metadata.description,
            image: metadata.image,
            customImage: customImage || null,
            domain: metadata.domain,
            price: metadata.price,
            note: note || null
          };
        } catch (error) {
          console.error(`Failed to fetch metadata for ${newUrl}:`, error);
          try {
            // Fallback data
            const urlObj = new URL(newUrl);
            const domain = urlObj.hostname;
            const fallbackData = this.getFallbackData(newUrl, domain);
            
            data.links[linkIndex] = {
              ...data.links[linkIndex],
              url: newUrl,
              ...fallbackData,
              title: title || fallbackData.title,
              customImage: customImage || null,
              note: note || null
            };
          } catch (urlError) {
            // URL이 완전히 유효하지 않은 경우
            data.links[linkIndex] = {
              ...data.links[linkIndex],
              url: newUrl,
              title: title || "잘못된 링크",
              description: "유효하지 않은 URL입니다.",
              image: null,
              customImage: customImage || null,
              domain: "",
              price: null,
              note: note || null
            };
          }
        }
      }
    } else {
      // URL이 같으면 title, note, customImage 업데이트
      if (title) data.links[linkIndex].title = title;
      data.links[linkIndex].note = note || null;
      data.links[linkIndex].customImage = customImage || null;
    }

    await this.saveLinksData(data);
    return data.links[linkIndex];
  }

  async verifyAdmin(username: string, password: string): Promise<boolean> {
    try {
      const result = await db.get('admin_data');
      
      // ReplDB 응답 구조 처리
      let adminData;
      if (result && result.ok && result.value) {
        adminData = result.value;
      } else if (result && !result.ok) {
        return false;
      } else {
        adminData = result;
      }
      
      if (!adminData) return false;
      
      // 배열로 변경된 admin 데이터에서 사용자 찾기
      const admin = Array.isArray(adminData) ? 
        adminData.find((admin: any) => admin.username === username) :
        (adminData.username === username ? adminData : null);
      
      if (!admin) return false;
      
      const bcrypt = await import('bcrypt');
      return await bcrypt.compare(password, admin.password);
    } catch (error) {
      console.error('Failed to verify admin:', error);
      return false;
    }
  }

  async changeAdminPassword(username: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const result = await db.get('admin_data');
      
      // ReplDB 응답 구조 처리
      let adminData;
      if (result && result.ok && result.value) {
        adminData = result.value;
      } else if (result && !result.ok) {
        return false;
      } else {
        adminData = result;
      }
      
      if (!adminData) return false;
      
      // 기존 비밀번호 확인
      const isOldPasswordValid = await this.verifyAdmin(username, oldPassword);
      if (!isOldPasswordValid) {
        return false;
      }
      
      // 배열 형태로 변환 (기존 단일 객체 지원)
      if (!Array.isArray(adminData)) {
        adminData = [adminData];
      }
      
      // 사용자 찾아서 비밀번호 변경
      const adminIndex = adminData.findIndex((admin: any) => admin.username === username);
      if (adminIndex === -1) return false;
      
      const bcrypt = await import('bcrypt');
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      adminData[adminIndex].password = hashedNewPassword;
      
      await db.set('admin_data', adminData);
      return true;
    } catch (error) {
      console.error('Failed to change admin password:', error);
      return false;
    }
  }

  async getBackupData(): Promise<FileData> {
    return await this.readLinksData();
  }

  async restoreFromBackup(backupData: FileData): Promise<void> {
    // 날짜 객체 복원
    const restoredLinks = backupData.links.map(link => ({
      ...link,
      createdAt: new Date(link.createdAt!)
    }));
    
    const data: FileData = {
      urls: backupData.urls,
      links: restoredLinks
    };
    
    await this.saveLinksData(data);
  }

  // 이미지 저장 (ReplDB에 base64로 저장)
  async saveImage(buffer: Buffer, filename: string): Promise<string> {
    try {
      const base64Data = buffer.toString('base64');
      const imageKey = `image_${filename}`;
      await db.set(imageKey, base64Data);
      return `/api/images/${filename}`;
    } catch (error) {
      console.error('Failed to save image to ReplDB:', error);
      throw error;
    }
  }

  // 이미지 불러오기
  async getImage(filename: string): Promise<Buffer | null> {
    try {
      const imageKey = `image_${filename}`;
      const result = await db.get(imageKey);
      
      // ReplDB 응답 구조 처리
      let base64Data;
      if (result && result.ok && result.value) {
        base64Data = result.value;
      } else if (result && !result.ok) {
        return null;
      } else {
        base64Data = result;
      }
      
      if (!base64Data) return null;
      
      return Buffer.from(base64Data, 'base64');
    } catch (error) {
      console.error('Failed to get image from ReplDB:', error);
      return null;
    }
  }
}

export const replDBStorage = new ReplDBStorage();