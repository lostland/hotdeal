import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { replDBStorage } from "./replDBStorage";
import { insertLinkSchema } from "@shared/schema";
import { fetchMetadata } from "./metadata";
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

let wss: WebSocketServer;

// fetchMetadata 순차 처리를 위한 큐
const metadataQueue: Array<{ url: string, task: () => Promise<any> }> = [];
let isProcessing = false;
let lastDomain = '';

async function processMetadataQueue() {
  if (isProcessing || metadataQueue.length === 0) return;
  
  isProcessing = true;
  while (metadataQueue.length > 0) {
    const item = metadataQueue.shift();
    if (item) {
      try {
        // 현재 URL의 도메인 추출
        const currentDomain = new URL(item.url).hostname;
        
        // 같은 사이트면 1초, 다른 사이트면 100ms 대기
        let delay = 100;
        if (lastDomain === currentDomain) {
          delay = 1000; // 같은 사이트: 1초
        }
        
        await item.task();
        lastDomain = currentDomain;
        
        // 요청 간 간격 추가
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error('Queue task error:', error);
      }
    }
  }
  isProcessing = false;
}

function queueMetadataRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    metadataQueue.push({
      url,
      task: async () => {
        try {
          const result = await fetchMetadata(url);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    });
    processMetadataQueue();
  });
}

// Multer 설정 - 메모리 스토리지로 변경 (ReplDB 저장용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all links
  app.get("/api/links", async (req, res) => {
    try {
      const links = await replDBStorage.getAllLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  // Get real-time price for a specific URL
  app.get("/api/price/:linkId", async (req, res) => {
    try {
      const { linkId } = req.params;
      
      const links = await replDBStorage.getAllLinks();
      const link = links.find(l => l.id === linkId);
      
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }

      // Fetch fresh metadata to get current price (순차 처리)
      const metadata = await queueMetadataRequest(link.url);
      
      res.json({ 
        price: metadata.price,
        linkId: linkId 
      });
    } catch (error) {
      console.error("Error fetching real-time price:", error);
      res.status(500).json({ message: "Failed to fetch price" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const isValid = await replDBStorage.verifyAdmin(username, password);
      
      if (isValid) {
        res.json({ success: true, message: "Login successful", username });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Change admin password
  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { username, oldPassword, newPassword } = req.body;
      
      if (!username || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "모든 필드를 입력해주세요." });
      }

      if (newPassword.length < 4) {
        return res.status(400).json({ message: "새 비밀번호는 4자 이상이어야 합니다." });
      }

      const success = await replDBStorage.changeAdminPassword(username, oldPassword, newPassword);
      
      if (success) {
        res.json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." });
      } else {
        res.status(401).json({ success: false, message: "현재 비밀번호가 올바르지 않습니다." });
      }
    } catch (error) {
      console.error("Error changing admin password:", error);
      res.status(500).json({ message: "비밀번호 변경 중 오류가 발생했습니다." });
    }
  });

  // Download backup data
  app.get("/api/admin/backup", async (req, res) => {
    try {
      const backupData = await replDBStorage.getBackupData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="links-backup-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(backupData);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "백업 생성 중 오류가 발생했습니다." });
    }
  });

  // Restore from backup data
  app.post("/api/admin/restore", async (req, res) => {
    try {
      const { backupData } = req.body;
      
      if (!backupData || !backupData.urls || !backupData.links) {
        return res.status(400).json({ message: "잘못된 백업 데이터 형식입니다." });
      }

      await replDBStorage.restoreFromBackup(backupData);
      
      res.json({ success: true, message: "데이터가 성공적으로 복원되었습니다." });
    } catch (error) {
      console.error("Error restoring from backup:", error);
      res.status(500).json({ message: "데이터 복원 중 오류가 발생했습니다." });
    }
  });

  // Get URLs (admin only)
  app.get("/api/admin/urls", async (req, res) => {
    try {
      const urls = await replDBStorage.getUrls();
      res.json(urls);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      res.status(500).json({ message: "Failed to fetch URLs" });
    }
  });

  // ReplDB 저장된 이미지 서빙
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const imageBuffer = await replDBStorage.getImage(filename);
      
      if (!imageBuffer) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      // 이미지 MIME 타입 설정 (확장자로 추정)
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg'; // 기본값
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
      
      res.set('Content-Type', contentType);
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(404).json({ message: "Image not found" });
    }
  });

  // ReplDB 이미지 업로드 엔드포인트
  app.post("/api/images/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "이미지 파일이 필요합니다." });
      }
      
      // 파일명 생성
      const ext = path.extname(req.file.originalname);
      const filename = `${randomUUID()}${ext}`;
      
      // ReplDB에 이미지 저장
      const imageUrl = await replDBStorage.saveImage(req.file.buffer, filename);
      
      res.json({ 
        success: true,
        imageUrl: imageUrl,
        filename: filename 
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "이미지 업로드 중 오류가 발생했습니다." });
    }
  });

  // Add URL (admin only)
  app.post("/api/admin/urls", async (req, res) => {
    try {
      const { url, note, customImage } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // 이미지 URL이 있으면 그대로 사용 (로컬 파일 경로)
      let normalizedImage = customImage;

      const newLink = await replDBStorage.addUrl(url, note, normalizedImage);
      
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

  // Update URL (admin only)
  app.put("/api/admin/urls", async (req, res) => {
    try {
      const { oldUrl, newUrl, title, note, customImage } = req.body;
      
      if (!oldUrl || !newUrl) {
        return res.status(400).json({ message: "Old URL and new URL are required" });
      }

      // 이미지 URL이 있으면 그대로 사용 (로컬 파일 경로)
      let normalizedImage = customImage;

      const updatedLink = await replDBStorage.updateUrl(oldUrl, newUrl, title, note, normalizedImage);
      
      // WebSocket으로 실시간 업데이트 브로드캐스트
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({ type: 'linksUpdated' }));
          }
        });
      }
      
      res.json(updatedLink);
    } catch (error) {
      console.error("Error updating URL:", error);
      if (error instanceof Error) {
        if (error.message === 'Original URL not found') {
          res.status(404).json({ message: "Original URL not found" });
        } else if (error.message === 'New URL already exists') {
          res.status(400).json({ message: "New URL already exists" });
        } else {
          res.status(500).json({ message: "Failed to update URL" });
        }
      } else {
        res.status(500).json({ message: "Failed to update URL" });
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

      const removed = await replDBStorage.removeUrl(url);
      
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