import { z } from 'zod/v4'
import { useMessage } from '../hooks/use-message'

export const useLocation = () =>
  useMessage({
    name: 'face_on_keyboard_location',
    validator: z.object({
      segments: z.array(
        z.object({
          start_x: z.number(),
          start_y: z.number(),
          start_time: z.string().transform((s) => new Date(s)),
          end_x: z.number(),
          end_y: z.number(),
          end_time: z.string().transform((s) => new Date(s)),
        })
      ),
    }),
    sendOnLoad: true,
  })
