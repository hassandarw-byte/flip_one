import { users, leaderboard, type User, type InsertUser, type InsertLeaderboard, type LeaderboardEntry } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getLeaderboardEntry(deviceId: string): Promise<LeaderboardEntry | undefined>;
  submitScore(entry: InsertLeaderboard): Promise<LeaderboardEntry>;
  updateScore(deviceId: string, score: number): Promise<LeaderboardEntry | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.score))
      .limit(limit);
  }

  async getLeaderboardEntry(deviceId: string): Promise<LeaderboardEntry | undefined> {
    const [entry] = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.deviceId, deviceId));
    return entry || undefined;
  }

  async submitScore(entry: InsertLeaderboard): Promise<LeaderboardEntry> {
    const existing = await this.getLeaderboardEntry(entry.deviceId);
    
    if (existing) {
      if ((entry.score ?? 0) > existing.score) {
        const [updated] = await db
          .update(leaderboard)
          .set({ 
            score: entry.score, 
            username: entry.username,
            updatedAt: new Date() 
          })
          .where(eq(leaderboard.deviceId, entry.deviceId))
          .returning();
        return updated;
      }
      return existing;
    }
    
    const [newEntry] = await db
      .insert(leaderboard)
      .values(entry)
      .returning();
    return newEntry;
  }

  async updateScore(deviceId: string, score: number): Promise<LeaderboardEntry | undefined> {
    const [updated] = await db
      .update(leaderboard)
      .set({ score, updatedAt: new Date() })
      .where(eq(leaderboard.deviceId, deviceId))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
