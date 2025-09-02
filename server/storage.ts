import { type User, type InsertUser, type Link, type InsertLink } from "@shared/schema";
import { randomUUID } from "crypto";
import { fetchMetadata } from "./metadata";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllLinks(): Promise<Link[]>;
  getLinkById(id: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: string, link: Partial<InsertLink>): Promise<Link | undefined>;
  deleteLink(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private links: Map<string, Link>;

  constructor() {
    this.users = new Map();
    this.links = new Map();
    
    // Initialize with the provided links
    this.initializeDefaultLinks();
  }

  private async initializeDefaultLinks() {
    // 기본 URL들만 저장
    const defaultUrls = [
      "https://naver.me/GhbGqQSN",
      "https://store.kakao.com/bluemingreen/products/243568345?shareLinkUuid=ypAZ9ub0JsfqD08i&ref=SHARE_AF",
      "https://link.gmarket.co.kr/etuXJmXxWh"
    ];

    // 각 URL에 대해 메타데이터를 가져와서 링크 생성
    for (const url of defaultUrls) {
      try {
        const metadata = await fetchMetadata(url);
        const linkData = {
          url,
          ...metadata
        };
        await this.createLink(linkData);
      } catch (error) {
        console.error(`Failed to fetch metadata for ${url}:`, error);
        // 메타데이터 가져오기에 실패해도 기본 fallback 정보로 링크 생성
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        let fallbackData;
        if (url.includes('naver.me/GhbGqQSN') || url.includes('brand.naver.com/bbsusan')) {
          fallbackData = {
            title: '사세 치킨가라아게 500g 순살치킨!',
            description: '[빈비수산] 순살육(국내산수입) 순살가공, 순살가공 축육식품 전문',
            image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
            price: '4,300원',
            domain: domain
          };
        } else if (url.includes('store.kakao.com')) {
          fallbackData = {
            title: '블루민그린 프리미엄 스킨케어 세트',
            description: '자연 성분으로 만든 친환경 스킨케어 제품으로 건강한 피부를 위한 선택입니다.',
            image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
            price: '29,900원',
            domain: domain
          };
        } else if (url.includes('gmarket.co.kr')) {
          fallbackData = {
            title: '달콤한 허니듀 멜론 대과 1.8kg 2과',
            description: '(한정수량)(신선집중) 달콤하고 신선한 허니듀 멜론을 만나보세요. 대과 사이즈 1.8kg 2과로 구성되어 있습니다.',
            image: 'https://gdimg.gmarket.co.kr/4517012388/still/300',
            price: '19,800원',
            domain: domain
          };
        } else {
          fallbackData = {
            title: `${domain} 페이지`,
            description: `${domain}의 페이지입니다.`,
            image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
            price: null,
            domain: domain
          };
        }
        
        await this.createLink({
          url,
          ...fallbackData
        });
      }
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllLinks(): Promise<Link[]> {
    return Array.from(this.links.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getLinkById(id: string): Promise<Link | undefined> {
    return this.links.get(id);
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = randomUUID();
    const link: Link = {
      url: insertLink.url,
      title: insertLink.title ?? null,
      description: insertLink.description ?? null,
      image: insertLink.image ?? null,
      domain: insertLink.domain ?? null,
      price: insertLink.price ?? null,
      id,
      createdAt: new Date(),
    };
    this.links.set(id, link);
    return link;
  }

  async updateLink(id: string, updateData: Partial<InsertLink>): Promise<Link | undefined> {
    const existingLink = this.links.get(id);
    if (!existingLink) return undefined;

    const updatedLink: Link = {
      ...existingLink,
      ...updateData,
    };
    this.links.set(id, updatedLink);
    return updatedLink;
  }

  async deleteLink(id: string): Promise<boolean> {
    return this.links.delete(id);
  }
}

export const storage = new MemStorage();
