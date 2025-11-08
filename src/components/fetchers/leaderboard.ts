import { mockLeaderboard } from '@/mock/leaderboard'

export type LeaderBoard = {
	userId: string
	userName: string
	weeklyCO2: number
	isCurrentUser: boolean
}[]

export const useLeaderBoard = ({
	userEmail,
	weeklyCO2,
}: {
	userEmail?: string
	weeklyCO2?: number
}) => ({
	data: mockLeaderboard({
		userEmail: userEmail ?? '',
		weeklyCO2: weeklyCO2 ?? 0,
	}).sort((a, b) => a.weeklyCO2 - b.weeklyCO2),
	isLoading: false,
	error: null,
})
