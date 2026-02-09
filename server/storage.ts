
import { db } from "./db";
import { deployments, type Deployment, type InsertDeployment } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getDeployments(): Promise<Deployment[]>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  createDeployment(deployment: InsertDeployment & { generatedFiles: Record<string, string> }): Promise<Deployment>;
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
}

export const storage = new DatabaseStorage();
