import { type User, type InsertUser, type Link, type InsertLink } from "@shared/schema";
import { randomUUID } from "crypto";

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
    const defaultLinks = [
      {
        url: "https://naver.me/GhbGqQSN",
        title: "사세 치킨가라아게 500g 순살치킨! 4300",
        description: "[빈비수산] 순살육(국내산수입) 순살가공,순살가공 축육식품 전문",
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        domain: "naver.me"
      },
      {
        url: "https://store.kakao.com/bluemingreen/products/243568345?shareLinkUuid=ypAZ9ub0JsfqD08i&ref=SHARE_AF",
        title: "블루민그린 프리미엄 스킨케어 세트",
        description: "자연 성분으로 만든 친환경 스킨케어 제품으로 건강한 피부를 위한 선택입니다.",
        image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        domain: "store.kakao.com"
      },
      {
        url: "https://link.gmarket.co.kr/1DbW01byu",
        title: "스마트폰 특가 할인 이벤트",
        description: "최신 스마트폰을 합리적인 가격에 만나보세요. 다양한 브랜드와 모델을 한번에!",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
        domain: "gmarket.co.kr"
      }
    ];

    for (const linkData of defaultLinks) {
      await this.createLink(linkData);
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
      ...insertLink,
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
