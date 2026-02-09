
import { db } from "./db";
import { deployments, settings, type Deployment, type InsertDeployment, type Setting, type InsertSetting } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getDeployments(): Promise<Deployment[]>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  createDeployment(deployment: InsertDeployment & { generatedFiles: Record<string, string> }): Promise<Deployment>;
  deleteDeployment(id: number): Promise<boolean>;
  getSettings(): Promise<Setting[]>;
  updateSetting(setting: InsertSetting): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  async getDeployments(): Promise<Deployment[]> {
    return await db.select().from(deployments).orderBy(deployments.createdAt);
  }

  async getDeployment(id: number): Promise<Deployment | undefined> {
    const [deployment] = await db.select().from(deployments).where(eq(deployments.id, id));
    return deployment;
  }

  async createDeployment(insertDeployment: InsertDeployment & { generatedFiles: Record<string, string> }): Promise<Deployment> {
    const [deployment] = await db.insert(deployments).values(insertDeployment).returning();
    return deployment;
  }

  async deleteDeployment(id: number): Promise<boolean> {
    const result = await db.delete(deployments).where(eq(deployments.id, id)).returning();
    return result.length > 0;
  }

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSetting(insertSetting: InsertSetting): Promise<Setting> {
    const [existing] = await db.select().from(settings).where(eq(settings.key, insertSetting.key));
    if (existing) {
      const [updated] = await db.update(settings).set({ value: insertSetting.value }).where(eq(settings.key, insertSetting.key)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(insertSetting).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
