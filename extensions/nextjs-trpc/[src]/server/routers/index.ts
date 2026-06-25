import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().optional() }))
    .query(({ input }) => ({
      greeting: `Hello ${input.text ?? 'world'}`,
    })),
});

export type AppRouter = typeof appRouter;
