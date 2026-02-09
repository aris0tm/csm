
import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(), // aws, azure, gcp
  region: text("region").notNull(),
  instanceSize: text("instance_size").notNull(),
  status: text("status").notNull().default("generated"), // generated, failed
  generatedFiles: jsonb("generated_files").$type<Record<string, string>>(), // Store content of generated files for display
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertDeploymentSchema = createInsertSchema(deployments).pick({
  provider: true,
  region: true,
  instanceSize: true,
});

export const insertSettingSchema = createInsertSchema(settings);

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type CreateDeploymentRequest = InsertDeployment;
export type DeploymentResponse = Deployment;
