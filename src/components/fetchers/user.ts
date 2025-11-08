import { userInfoSchema } from '@/lib/events'
import { useMessage } from '../hooks/use-message'

export const useUser = () =>
	useMessage({
		name: 'userinfo',
		validator: userInfoSchema,
		sendOnLoad: true,
	})
