import { type Link, type InsertLink } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from 'fs/promises';
import path from 'path';
import { fetchMetadata } from "./metadata";

const DATA_FILE = path.join(process.cwd(), 'data', 'links.json');
const ADMIN_FILE = path.join(process.cwd(), 'data', 'admin.json');

export interface FileData {
  links: Link[];
  urls: string[];
}

export class FileStorage {
  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.mkdir(path.dirname(ADMIN_FILE), { recursive: true });

      // 링크 데이터 파일 초기화
      try {
        await fs.readFile(DATA_FILE, 'utf8');
        console.log('기존 링크 데이터 파일을 확인했습니다.');
      } catch (error) {
        console.log('링크 데이터 파일이 없어 빈 데이터로 시작합니다.');
        const emptyData: FileData = {
          urls: [],
          links: []
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(emptyData, null, 2));
      }

      // Admin 계정 초기화 (기존 방식 유지)
      try {
        await fs.readFile(ADMIN_FILE, 'utf8');
        console.log('기존 관리자 계정 파일을 확인했습니다.');
      } catch (error) 
      
      {
        console.log('관리자 계정 파일을 생성합니다.');
        const adminPassword = "$2b$10$q3bhJ2mYP.QNmRWoSTK4iuc8o9SOaVl88Er05yxLoinFJXh0AC6CG";
        const readyPassword = "$2b$10$CXWJj40kN/fZYmndOxo/oebQX2yDp1O.9dzRasBH64d1FHvmqU8F.";
        const adminData = [
          {
            username: 'admin',
            password: adminPassword
          },
          {
            username: 'ready',
            password: readyPassword
          }
        ];
        await fs.writeFile(ADMIN_FILE, JSON.stringify(adminData, null, 2));
      }
    } catch (error) {
      console.error('Failed to initialize file storage:', error);
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

  // admin.json과 동일한 방식으로 파일 읽기/쓰기
  private async readLinksData(): Promise<FileData> {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      const fileData = JSON.parse(data);
      
      // 날짜 객체 복원
      if (fileData?.links) {
        fileData.links = fileData.links.map((link: any) => ({
          ...link,
          createdAt: new Date(link.createdAt)
        }));
      }
      
      return fileData;
    } catch (error) {
      console.error('Failed to read links data:', error);
      return { urls: [], links: [] };
    }
  }

  private async saveLinksData(data: FileData): Promise<boolean> {
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save links data:', error);
      return false;
    }
  }

  async getAllLinks(): Promise<Link[]> {
    const data = await this.readLinksData();
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

  async updateUrl(oldUrl: string, newUrl: string, note?: string | null, customImage?: string | null): Promise<Link> {
    const data = await this.readLinksData();

    // 기존 URL이 존재하는지 확인
    const oldUrlIndex = data.urls.indexOf(oldUrl);
    if (oldUrlIndex === -1) {
      throw new Error('Original URL not found');
    }

    // 새 URL이 다르면서 이미 존재하는지 확인
    if (oldUrl !== newUrl && data.urls.includes(newUrl)) {
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
      try {
        const metadata = await fetchMetadata(newUrl);
        data.links[linkIndex] = {
          ...data.links[linkIndex],
          url: newUrl,
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
          customImage: customImage || null,
          domain: metadata.domain,
          price: metadata.price,
          note: note || null
        };
      } catch (error) {
        console.error(`Failed to fetch metadata for ${newUrl}:`, error);
        // Fallback data
        const urlObj = new URL(newUrl);
        const domain = urlObj.hostname;
        const fallbackData = this.getFallbackData(newUrl, domain);
        
        data.links[linkIndex] = {
          ...data.links[linkIndex],
          url: newUrl,
          ...fallbackData,
          customImage: customImage || null,
          note: note || null
        };
      }
    } else {
      // URL이 같으면 note와 customImage만 업데이트
      data.links[linkIndex].note = note || null;
      data.links[linkIndex].customImage = customImage || null;
    }

    await this.saveLinksData(data);
    return data.links[linkIndex];
  }

  async verifyAdmin(username: string, password: string): Promise<boolean> {
    try {
      const data = await fs.readFile(ADMIN_FILE, 'utf8');
      const adminData = JSON.parse(data);
      
      // 배열로 변경된 admin 데이터에서 사용자 찾기
      const admin = Array.isArray(adminData) ? 
        adminData.find(admin => admin.username === username) :
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
      const data = await fs.readFile(ADMIN_FILE, 'utf8');
      let adminData = JSON.parse(data);
      
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
      
      await fs.writeFile(ADMIN_FILE, JSON.stringify(adminData, null, 2));
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
}

export const fileStorage = new FileStorage();