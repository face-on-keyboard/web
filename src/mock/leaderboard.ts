import type { LeaderBoard } from '@/components/fetchers/leaderboard'

export const mockLeaderboard: ({
	userEmail,
	weeklyCO2,
}: {
	userEmail: string
	weeklyCO2: number
}) => LeaderBoard = ({ userEmail, weeklyCO2 }) => [
	{
		userId: 'user1',
		userName: 'Eco Master',
		weeklyCO2: 5.2,
		isCurrentUser: false,
	},
	{
		userId: 'user2',
		userName: userEmail,
		// 如果計算出的碳排量為0，使用一個測試值；否則使用實際計算值
		weeklyCO2: weeklyCO2 > 0 ? weeklyCO2 : 150.5,
		isCurrentUser: true,
	},
	{
		userId: 'user3',
		userName: 'Green Lifer',
		weeklyCO2: 8.5,
		isCurrentUser: false,
	},
	{
		userId: 'user4',
		userName: 'Carbon Pioneer',
		weeklyCO2: 12.3,
		isCurrentUser: false,
	},
	{
		userId: 'user5',
		userName: 'Eco Angel',
		weeklyCO2: 15.8,
		isCurrentUser: false,
	},
	{
		userId: 'user6',
		userName: 'Energy Expert',
		weeklyCO2: 18.6,
		isCurrentUser: false,
	},
	{
		userId: 'user7',
		userName: 'Low Carbon Lifer',
		weeklyCO2: 700,
		isCurrentUser: false,
	},
	{
		userId: 'user8',
		userName: 'Eco Beginner',
		weeklyCO2: 800,
		isCurrentUser: false,
	},
	{
		userId: 'user9',
		userName: 'Carbon Newbie',
		weeklyCO2: 305,
		isCurrentUser: false,
	},
	{
		userId: 'user10',
		userName: 'Just Started',
		weeklyCO2: 352,
		isCurrentUser: false,
	},
	{
		userId: 'user11',
		userName: 'Learning',
		weeklyCO2: 408,
		isCurrentUser: false,
	},
	{
		userId: 'user12',
		userName: 'New Member',
		weeklyCO2: 456,
		isCurrentUser: false,
	},
]
