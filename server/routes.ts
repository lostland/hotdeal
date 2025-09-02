import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { fileStorage } from "./fileStorage";
import { insertLinkSchema } from "@shared/schema";
import { fetchMetadata } from "./metadata";

let wss: WebSocketServer;

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all links
  app.get("/api/links", async (req, res) => {
    try {
      const links = await fileStorage.getAllLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const isValid = await fileStorage.verifyAdmin(username, password);
      
      if (isValid) {
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get URLs (admin only)
  app.get("/api/admin/urls", async (req, res) => {
    try {
      const urls = await fileStorage.getUrls();
      res.json(urls);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      res.status(500).json({ message: "Failed to fetch URLs" });
    }
  });

  // Add URL (admin only)
  app.post("/api/admin/urls", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const newLink = await fileStorage.addUrl(url);
      
      // WebSocket으로 실시간 업데이트 브로드캐스트
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({ type: 'linksUpdated' }));
          }
        });
      }
      
      res.status(201).json(newLink);
    } catch (error) {
      console.error("Error adding URL:", error);
      if (error instanceof Error && error.message === 'URL already exists') {
        res.status(400).json({ message: "URL already exists" });
      } else {
        res.status(500).json({ message: "Failed to add URL" });
      }
    }
  });

  // Remove URL (admin only)
  app.delete("/api/admin/urls", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const removed = await fileStorage.removeUrl(url);
      
      if (!removed) {
        return res.status(404).json({ message: "URL not found" });
      }

      // WebSocket으로 실시간 업데이트 브로드캐스트
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({ type: 'linksUpdated' }));
          }
        });
      }
      
      res.json({ message: "URL removed successfully" });
    } catch (error) {
      console.error("Error removing URL:", error);
      res.status(500).json({ message: "Failed to remove URL" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket 서버 설정
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  return httpServer;
}