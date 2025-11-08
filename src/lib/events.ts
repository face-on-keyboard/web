import { parse } from 'date-fns'
import { z } from 'zod/v4'

export const userInfoSchema = z.object({
	id: z.string(),
	realName: z.string(),
	email: z.email(),
	birthday: z.string().transform((s) => parse(s, 'yyyy/MM/dd', new Date())),
})

export type UserInfo = z.infer<typeof userInfoSchema>
