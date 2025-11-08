import { type json, z } from 'zod/v4'

export const stringToJSONSchema = z
  .string()
  .transform((str, ctx): z.infer<ReturnType<typeof json>> => {
    try {
      return JSON.parse(str)
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
      return z.NEVER
    }
  })
