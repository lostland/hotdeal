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
  private cache: FileData | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize() {
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

      try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        this.cache = JSON.parse(data);
        console.log(`파일에서 ${this.cache.urls?.length || 0}개 URL과 ${this.cache.links?.length || 0}개 링크를 로드했습니다.`);
        
        // 날짜 객체 복원
        if (this.cache?.links) {
          this.cache.links = this.cache.links.map(link => ({
            ...link,
            createdAt: new Date(link.createdAt!)
          }));
        }
        
        console.log('기존 저장된 데이터를 사용합니다.');
        
      } catch (error) {
        console.log('저장된 파일이 없어 빈 데이터로 시작합니다.');
        // 파일이 없으면 빈 상태로 시작
        this.cache = {
          urls: [],
          links: []
        };
        await this.saveToFile();
      }

      // Admin 계정 초기화 (암호화된 비밀번호 저장)
      try {
        await fs.readFile(ADMIN_FILE, 'utf8');
      } catch (error) {
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash('semicom11', 10);
        const adminData = {
          username: 'admin',
          password: hashedPassword
        };
        await fs.writeFile(ADMIN_FILE, JSON.stringify(adminData, null, 2));
      }
    } catch (error) {
      console.error('Failed to initialize file storage:', error);
      this.cache = { urls: [], links: [] };
    }
  }

  private async generateLinksFromUrls() {
    if (!this.cache) return;
    
    this.cache.links = [];
    
    for (const url of this.cache.urls) {
      try {
        const metadata = await fetchMetadata(url);
        const link: Link = {
          id: randomUUID(),
          url,
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
          domain: metadata.domain,
          price: metadata.price,
          note: null,
          createdAt: new Date()
        };
        this.cache.links.push(link);
      } catch (error) {
        console.error(`Failed to generate link for ${url}:`, error);
        // Fallback link with basic info
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        let fallbackData = this.getFallbackData(url, domain);
        
        const link: Link = {
          id: randomUUID(),
          url,
          ...fallbackData,
          note: null,
          createdAt: new Date()
        };
        this.cache.links.push(link);
      }
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

  private async saveToFile() {
    if (!this.cache) return;
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Failed to save to file:', error);
    }
  }

  async getAllLinks(): Promise<Link[]> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
    
    if (!this.cache) return [];
    
    // 기존 저장된 링크만 빠르게 반환
    return this.cache.links.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async addUrl(url: string, note?: string | null): Promise<Link> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }

    if (!this.cache) {
      throw new Error('Storage not initialized');
    }

    // URL 중복 체크
    if (this.cache.urls.includes(url)) {
      throw new Error('URL already exists');
    }

    // URL 추가
    this.cache.urls.push(url);

    // 메타데이터 가져와서 링크 생성
    try {
      const metadata = await fetchMetadata(url);
      const link: Link = {
        id: randomUUID(),
        url,
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        domain: metadata.domain,
        price: metadata.price,
        note: null,
        createdAt: new Date()
      };
      this.cache.links.push(link);
      await this.saveToFile();
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
        note: note || null,
        createdAt: new Date()
      };
      this.cache.links.push(link);
      await this.saveToFile();
      return link;
    }
  }

  async removeUrl(url: string): Promise<boolean> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }

    if (!this.cache) return false;

    const urlIndex = this.cache.urls.indexOf(url);
    if (urlIndex === -1) return false;

    // URL과 해당 링크 모두 제거
    this.cache.urls.splice(urlIndex, 1);
    this.cache.links = this.cache.links.filter(link => link.url !== url);
    
    await this.saveToFile();
    return true;
  }

  async getUrls(): Promise<string[]> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
    return this.cache?.urls || [];
  }

  async verifyAdmin(username: string, password: string): Promise<boolean> {
    try {
      const data = await fs.readFile(ADMIN_FILE, 'utf8');
      const adminData = JSON.parse(data);
      
      if (adminData.username !== username) return false;
      
      const bcrypt = await import('bcrypt');
      return await bcrypt.compare(password, adminData.password);
    } catch (error) {
      console.error('Failed to verify admin:', error);
      return false;
    }
  }
}

export const fileStorage = new FileStorage();