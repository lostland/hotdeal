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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      'No title found';

    const description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      'No description available';

    const image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      null;

    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    return {
      title: title.trim().substring(0, 200),
      description: description.trim().substring(0, 300),
      image: image && image.startsWith('http') ? image : null,
      domain
    };
  } catch (error) {
    console.error("Error fetching metadata for URL:", url, error);
    
    // Return minimal metadata for fallback
    const urlObj = new URL(url);
    return {
      title: `Link to ${urlObj.hostname}`,
      description: "No description available",
      image: null,
      domain: urlObj.hostname
    };
  }
}
