import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const links = pgTable("links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  title: text("title"),
  description: text("description"),
  image: text("image"),
  customImage: text("custom_image"), // 관리자가 업로드한 커스텀 이미지
  domain: text("domain"),
  price: text("price"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const statistics = pgTable("statistics", {
  id: varchar("id").primaryKey().default(sql`'global'`),
  visitorCount: integer("visitor_count").notNull().default(0),
  shareCount: integer("share_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull().unique(),
  buffer: text("buffer").notNull(), // base64 encoded
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLinkSchema = createInsertSchema(links).pick({
  url: true,
  title: true,
  description: true,
  image: true,
  customImage: true,
  domain: true,
  price: true,
  note: true,
});

export const insertStatisticsSchema = createInsertSchema(statistics).pick({
  visitorCount: true,
  shareCount: true,
});

export const insertImageSchema = createInsertSchema(images).pick({
  filename: true,
  buffer: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;
export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;
export type Statistics = typeof statistics.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
