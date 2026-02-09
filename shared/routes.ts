
import { z } from 'zod';
import { insertDeploymentSchema, deployments } from './schema';

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
  },
};
