
import { z } from 'zod';
import { insertDeploymentSchema, deployments, settings, insertSettingSchema } from './schema';

export const api = {
  deployments: {
    list: {
      method: 'GET' as const,
      path: '/api/deployments' as const,
      responses: {
        200: z.array(z.custom<typeof deployments.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/deployments/:id' as const,
      responses: {
        200: z.custom<typeof deployments.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/deployments' as const,
      input: insertDeploymentSchema,
      responses: {
        201: z.custom<typeof deployments.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/deployments/:id' as const,
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  settings: {
    list: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.array(z.custom<typeof settings.$inferSelect>()),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings' as const,
      input: z.object({
        key: z.string(),
        value: z.string(),
      }),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
