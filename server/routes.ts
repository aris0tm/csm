
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { generateTerraformCode } from "./lib/terraform";
import * as fs from "fs";
import * as path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.deployments.list.path, async (req, res) => {
    const deployments = await storage.getDeployments();
    res.json(deployments);
  });

  app.get(api.deployments.get.path, async (req, res) => {
    const deployment = await storage.getDeployment(Number(req.params.id));
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }
    res.json(deployment);
  });

  app.post(api.deployments.create.path, async (req, res) => {
    try {
      const input = api.deployments.create.input.parse(req.body);
      
      // Get settings for customization
      const settings = await storage.getSettings();
      const projectName = settings.find(s => s.key === "default_project_name")?.value || "cloud-deploy-demo";
      
      // Generate the code
      const files = generateTerraformCode(input.provider, input.region, input.instanceSize);
      
      // Write files to disk
      const baseDir = path.join(process.cwd(), "cloud-deploy");
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }

      // Create provider subdir
      const providerDir = path.join(baseDir, input.provider);
      if (!fs.existsSync(providerDir)) {
        fs.mkdirSync(providerDir, { recursive: true });
      }

      // Write all files
      Object.entries(files).forEach(([filepath, content]) => {
        const fullPath = path.join(baseDir, filepath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content.trim());
      });

      // Save to DB
      const deployment = await storage.createDeployment({
        ...input,
        generatedFiles: files
      });

      res.status(201).json(deployment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.deployments.delete.path, async (req, res) => {
    const success = await storage.deleteDeployment(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: 'Deployment not found' });
    }
    res.status(204).send();
  });

  app.get(api.settings.list.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    const input = api.settings.update.input.parse(req.body);
    const setting = await storage.updateSetting(input);
    res.json(setting);
  });

  // Seed data if empty
  const existing = await storage.getDeployments();
  if (existing.length === 0) {
    const seedInput = {
      provider: "aws",
      region: "us-east-1",
      instanceSize: "t2.micro"
    };
    const files = generateTerraformCode(seedInput.provider, seedInput.region, seedInput.instanceSize);
    await storage.createDeployment({
      ...seedInput,
      generatedFiles: files
    });
  }

  return httpServer;
}
