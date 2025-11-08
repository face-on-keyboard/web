import { z } from 'zod/v4'

export const locationSchema = z.object({
  start_x: z.number(),
  start_y: z.number(),
  start_time: z.string(),
  end_x: z.number(),
  end_y: z.number(),
  end_time: z.string(),
})
