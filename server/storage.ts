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
  private initialized = false;

  constructor() {
    this.users = new Map();
    this.links = new Map();
    
    // Initialize with the provided links synchronously first with basic data
    this.createDefaultLinksSync();
    // Then try to fetch metadata asynchronously
    this.initializeDefaultLinks();
  }

  private createDefaultLinksSync() {
    // 빈 시작 - 하드코딩된 데이터 없음
    this.initialized = true;
  }

  private async initializeDefaultLinks() {
    // 하드코딩된 기본 링크 없음 - 빈 상태에서 시작
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
      customImage: insertLink.customImage ?? null,
      domain: insertLink.domain ?? null,
      price: insertLink.price ?? null,
      note: insertLink.note ?? null,
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
