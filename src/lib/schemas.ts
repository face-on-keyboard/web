import { z } from 'zod/v4'

export const locationSchema = z.object({
  start_x: z.number(),
  start_y: z.number(),
  start_time: z.string(),
  end_x: z.number(),
  end_y: z.number(),
  end_time: z.string(),
  estimated_co2: z.number().optional(),
})

export const faceOnKeyboardHealthSchema = z.object({
  steps: z.number(),
  distance_meters: z.number(),
  start_time: z.string(),
  end_time: z.string(),
})

export type FaceOnKeyboardHealth = z.infer<typeof faceOnKeyboardHealthSchema>
