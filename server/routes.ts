import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Leaderboard routes
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const entries = await storage.getLeaderboard(limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { username, score, deviceId } = req.body;
      
      if (!username || score === undefined || !deviceId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const entry = await storage.submitScore({ username, score, deviceId });
      res.json(entry);
    } catch (error) {
      console.error("Error submitting score:", error);
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  app.get("/api/leaderboard/:deviceId", async (req, res) => {
    try {
      const entry = await storage.getLeaderboardEntry(req.params.deviceId);
      if (entry) {
        res.json(entry);
      } else {
        res.status(404).json({ error: "Entry not found" });
      }
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ error: "Failed to fetch entry" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
