// 對話目錄項目類型
export interface ChatMenuItem {
	id: string
	title: string
	description?: string
	icon?: string
}

// 消息類型
export interface ChatMessage {
	id: string
	type: 'elf' | 'user'
	content: string
	timestamp: Date
	menuItems?: ChatMenuItem[] // 如果是目錄消息，包含可選項目
	showBackToMenu?: boolean // 是否顯示返回目錄按鈕
}

// 對話狀態
export type ChatState = 'menu' | 'conversation' | 'loading'

// 對話上下文類型
export interface ChatContext {
	messages: ChatMessage[]
	currentState: ChatState
	selectedMenuItemId: string | null
}

