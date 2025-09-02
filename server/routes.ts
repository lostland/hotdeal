import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLinkSchema } from "@shared/schema";
import { fetchMetadata } from "./metadata";

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