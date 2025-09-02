import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLinkSchema } from "@shared/schema";
import * as cheerio from "cheerio";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all links
  app.get("/api/links", async (req, res) => {
    try {
      const links = await storage.getAllLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  // Create a new link with metadata fetching
  app.post("/api/links", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Fetch metadata from the URL
      const metadata = await fetchMetadata(url);
      
      const linkData = {
        url,
        ...metadata
      };

      // Validate the data
      const validatedData = insertLinkSchema.parse(linkData);
      
      const newLink = await storage.createLink(validatedData);
      res.status(201).json(newLink);
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ message: "Failed to create link" });
    }
  });

  // Delete a link
  app.delete("/api/links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLink(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Link not found" });
      }
      
      res.json({ message: "Link deleted successfully" });
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(500).json({ message: "Failed to delete link" });
    }
  });

  // Fetch metadata for a URL
  app.post("/api/metadata", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const metadata = await fetchMetadata(url);
      res.json(metadata);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      res.status(500).json({ 
        message: "Failed to fetch metadata",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function fetchMetadata(url: string) {
  try {
    // Try multiple user agents to avoid blocking
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    ];

    let response = null;
    let lastError = null;

    // Try each user agent until one works
    for (const userAgent of userAgents) {
      try {
        response = await fetch(url, {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (response.ok) break;
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    if (!response || !response.ok) {
      throw new Error(`HTTP ${response?.status || 'UNKNOWN'}: ${response?.statusText || 'Request failed'}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata with more fallback options
    let title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      '';

    let description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="summary"]').attr('content') ||
      '';

    let image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href') ||
      null;

    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Generate better fallback title if none found
    if (!title.trim()) {
      if (domain.includes('naver')) {
        title = '네이버 상품';
      } else if (domain.includes('kakao')) {
        title = '카카오 상품';
      } else if (domain.includes('gmarket')) {
        title = 'G마켓 상품';
      } else {
        title = `${domain} 페이지`;
      }
    }

    // Generate better fallback description
    if (!description.trim()) {
      if (domain.includes('naver')) {
        description = '네이버에서 판매하는 상품입니다.';
      } else if (domain.includes('kakao')) {
        description = '카카오에서 판매하는 상품입니다.';
      } else if (domain.includes('gmarket')) {
        description = 'G마켓에서 판매하는 상품입니다.';
      } else {
        description = `${domain}의 페이지입니다.`;
      }
    }

    // Use a default placeholder image for Korean shopping sites if no image found
    if (!image) {
      if (domain.includes('naver')) {
        image = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      } else if (domain.includes('kakao')) {
        image = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      } else if (domain.includes('gmarket')) {
        image = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      } else {
        image = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
      }
    }

    // Ensure absolute URLs for images
    if (image && !image.startsWith('http')) {
      try {
        image = new URL(image, url).href;
      } catch {
        image = null;
      }
    }

    return {
      title: title.trim().substring(0, 200) || `${domain} 페이지`,
      description: description.trim().substring(0, 300) || `${domain}의 페이지입니다.`,
      image: image && image.startsWith('http') ? image : 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450',
      domain
    };
  } catch (error) {
    console.error("Error fetching metadata for URL:", url, error);
    
    // Return better fallback metadata
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    let fallbackTitle = '';
    let fallbackDescription = '';
    let fallbackImage = '';
    
    if (domain.includes('naver')) {
      fallbackTitle = '네이버 상품';
      fallbackDescription = '네이버에서 판매하는 상품입니다.';
      fallbackImage = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
    } else if (domain.includes('kakao')) {
      fallbackTitle = '카카오 상품';
      fallbackDescription = '카카오에서 판매하는 상품입니다.';
      fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
    } else if (domain.includes('gmarket')) {
      fallbackTitle = 'G마켓 상품';
      fallbackDescription = 'G마켓에서 판매하는 상품입니다.';
      fallbackImage = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
    } else {
      fallbackTitle = `${domain} 페이지`;
      fallbackDescription = `${domain}의 페이지입니다.`;
      fallbackImage = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450';
    }
    
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      image: fallbackImage,
      domain: domain
    };
  }
}
