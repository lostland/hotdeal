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
        // 메타데이터 가져오기에 실패해도 기본 URL로 링크 생성
        await this.createLink({
          url,
          title: null,
          description: null,
          image: null,
          domain: null,
          price: null
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
