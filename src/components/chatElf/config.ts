import type { ChatMenuItem } from './types'

/**
 * 對話內容數據
 */
interface ChatTopic {
	topic: string
	message: string
}

const CHAT_TOPICS: ChatTopic[] = [
	{
		topic: '居家節能',
		message:
			'💡 居家減碳建議：\n- 將冷氣設定在 26–28°C，每少 1°C 就多耗 6% 電。\n- 關掉待機電源（電視、音響等），可省下 5–10% 電。\n- 使用自然風或除濕機代替烘衣。\n- 換成 LED 燈泡，可減少用電 80%。\n\n🌟 最有效三招：\n1️⃣ 冷氣設定 26–28°C\n2️⃣ 關掉待機電源\n3️⃣ 換成 LED 燈泡\n平均每月可減少約 20–30 kg CO₂！',
	},
	{
		topic: '交通出行',
		message:
			'🚲 出門減碳小建議：\n- 3 公里內改步行或騎車，減少約 0.8 kg CO₂。\n- 搭乘大眾運輸取代汽機車，減少 60–80% 碳排。\n- 規劃行程，減少多次短距離移動。\n\n💪 零碳通勤挑戰：\n連續三天以步行、騎車或搭捷運上班。\n完成可減少約 3–5 kg CO₂，還能解鎖「綠色移動家」徽章 🚉',
	},
	{
		topic: '飲食習慣',
		message:
			'🥦 飲食減碳建議：\n- 每週一天蔬食，可減少約 3 kg CO₂。\n- 改喝植物奶（豆奶／燕麥奶）比牛奶減碳 70%。\n- 少吃紅肉、多選當地食材。\n\n🍽 綠色飲食任務：\n- 一週兩餐蔬食 🌿\n- 嘗試三次自帶餐盒外食 🍱\n- 優先購買在地蔬果 🌾\n完成一週可減少約 6–10 kg CO₂！',
	},
	{
		topic: '消費與購物',
		message:
			'🛍 減碳購物建議：\n- 優先購買耐用、可維修的產品。\n- 二手商品可減少 60% 製造碳排。\n- 拒絕一次性包裝、攜帶購物袋。\n- 網購時合併下單，減少運輸碳排。\n\n💚 綠色消費挑戰：\n嘗試一週不買一次性商品，平均可減少 2–4 kg CO₂！',
	},
	{
		topic: '數位生活',
		message:
			'📱 數位減碳建議：\n- 清理雲端重複檔案，減少伺服器能耗。\n- 關閉背景自動上傳功能。\n- 開會時以語音代替視訊，可減碳約 90%。\n- 設定螢幕自動關閉時間在 1 分鐘內。\n\n💡 小提醒：數位世界也需要節能，少一個不必要的影片串流，就能讓伺服器少一份壓力 🌍',
	},
]

/**
 * 主題圖標映射
 */
const TOPIC_ICONS: Record<string, string> = {
	'居家節能': '💡',
	'交通出行': '🚲',
	'飲食習慣': '🥦',
	'消費與購物': '🛍',
	'數位生活': '📱',
}

/**
 * 主題描述映射
 */
const TOPIC_DESCRIPTIONS: Record<string, string> = {
	'居家節能': '學習如何在家節省能源',
	'交通出行': '選擇更環保的交通方式',
	'飲食習慣': '通過飲食減少碳足跡',
	'消費與購物': '綠色消費的智慧選擇',
	'數位生活': '減少數位生活的碳排放',
}

/**
 * 對話目錄配置
 */
export const CHAT_MENU_ITEMS: ChatMenuItem[] = CHAT_TOPICS.map((topic, index) => ({
	id: String(index + 1),
	title: topic.topic,
	description: TOPIC_DESCRIPTIONS[topic.topic] || '',
	icon: TOPIC_ICONS[topic.topic] || '🌱',
}))

/**
 * 根據目錄項目 ID 獲取回答
 * 
 * @param menuId 目錄項目 ID
 * @returns 回答內容
 */
export function getAnswerByMenuId(menuId: string): string {
	const index = Number.parseInt(menuId, 10) - 1
	if (index >= 0 && index < CHAT_TOPICS.length) {
		return CHAT_TOPICS[index].message
	}
	return '抱歉，我暫時無法回答這個問題。'
}

/**
 * 歡迎消息
 */
export const WELCOME_MESSAGE =
	'你好！我是減碳小精靈，我可以幫助你了解減碳相關資訊。請選擇一個主題開始吧！'

