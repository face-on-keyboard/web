import type { CarbonRecord, CarbonRecordItem } from '@/lib/carbon-records'
import { db } from '@/server/db'
import type { Invoice } from 'mock/server'
import { compareTwoStrings } from 'string-similarity'

// 計算字串相似度（使用多種策略）
export function calculateSimilarity(
	input: string,
	target: string,
): { score: number; method: string } {
	const inputLower = input.toLowerCase().trim()
	const targetLower = target.toLowerCase().trim()

	// 1. 精確匹配
	if (inputLower === targetLower) {
		return { score: 1.0, method: 'exact' }
	}

	// 2. 包含匹配（input 包含在 target 中，或相反）
	if (targetLower.includes(inputLower) || inputLower.includes(targetLower)) {
		const longer =
			inputLower.length > targetLower.length ? inputLower : targetLower
		const shorter =
			inputLower.length > targetLower.length ? targetLower : inputLower
		return {
			score: 0.8 + (shorter.length / longer.length) * 0.2,
			method: 'contains',
		}
	}

	// 3. 使用 Dice 係數（bigram 相似度）
	const diceScore = compareTwoStrings(inputLower, targetLower)
	if (diceScore > 0.6) {
		return { score: diceScore, method: 'dice' }
	}

	// 4. 部分詞匹配（檢查是否有共同詞）
	const inputWords = inputLower.split(/\s+/)
	const targetWords = targetLower.split(/\s+/)
	const commonWords = inputWords.filter((word) =>
		targetWords.some((tw) => tw.includes(word) || word.includes(tw)),
	)
	if (commonWords.length > 0) {
		const wordScore =
			commonWords.length / Math.max(inputWords.length, targetWords.length)
		return { score: wordScore * 0.7, method: 'word_match' }
	}

	return { score: diceScore, method: 'dice' }
}

// 查找最匹配的碳標籤產品
export async function findBestMatch(productName: string) {
	// 先嘗試精確匹配或包含匹配
	// 查詢 status 不是 '過期' 的記錄（包括 null）
	const exactMatches = await db.carbonLabel.findMany({
		where: {
			productName: {
				contains: productName,
				mode: 'insensitive',
			},
			OR: [{ status: null }, { status: { not: '過期' } }],
		},
		take: 10,
	})

	if (exactMatches.length > 0) {
		// 計算相似度並排序
		const matchesWithScore = exactMatches.map((match) => ({
			...match,
			similarity: calculateSimilarity(productName, match.productName),
		}))

		matchesWithScore.sort((a, b) => b.similarity.score - a.similarity.score)

		return matchesWithScore[0]
	}

	// 如果沒有找到包含匹配，查詢所有有效的碳標籤並計算相似度
	const allLabels = await db.carbonLabel.findMany({
		where: {
			OR: [{ status: null }, { status: { not: '過期' } }],
		},
		take: 100, // 限制查詢數量以提高效能
	})

	if (allLabels.length === 0) {
		return null
	}

	// 計算所有產品的相似度
	const matchesWithScore = allLabels.map((label) => ({
		...label,
		similarity: calculateSimilarity(productName, label.productName),
	}))

	// 過濾相似度低於 0.3 的結果
	const filteredMatches = matchesWithScore.filter(
		(m) => m.similarity.score >= 0.3,
	)

	if (filteredMatches.length === 0) {
		return null
	}

	// 按相似度排序，返回最佳匹配
	filteredMatches.sort((a, b) => b.similarity.score - a.similarity.score)

	return filteredMatches[0]
}

// 計算單個商品的碳足跡
export async function calculateProductCarbonFootprint(
	productName: string,
	quantity: number,
) {
	const match = await findBestMatch(productName)

	if (!match) {
		return {
			success: false,
			message: '找不到匹配的碳標籤產品',
			data: {
				productName,
				quantity,
				carbonFootprint: null,
				carbonFootprintUnit: null,
				matchedProduct: null,
				similarity: null,
			},
		}
	}

	// 計算碳足跡 = 碳足跡數值 * 數量
	const carbonFootprintValue = Number(match.carbonFootprintValue)
	const totalCarbonFootprint = carbonFootprintValue * quantity

	return {
		success: true,
		message: '計算成功',
		data: {
			productName,
			quantity,
			carbonFootprint: Number(totalCarbonFootprint.toFixed(4)),
			carbonFootprintUnit: match.carbonFootprintUnit || 'kg',
			matchedProduct: {
				id: match.id,
				productName: match.productName,
				productModel: match.productModel,
				carbonFootprintValue: Number(carbonFootprintValue),
				carbonFootprintUnit: match.carbonFootprintUnit,
				declarationUnit: match.declarationUnit,
				companyName: match.companyName,
			},
			similarity: {
				score: match.similarity.score,
				method: match.similarity.method,
			},
		},
	}
}

export async function invoiceToCarbonRecords(
	invoice: Invoice,
): Promise<CarbonRecord> {
	// 處理每個發票明細項目
	const itemsPromises = invoice.details.map(async (detail) => {
		const quantity = Number.parseFloat(detail.quantity)
		const amount = Number.parseFloat(detail.amount)

		// 計算該商品的碳足跡
		const result = await calculateProductCarbonFootprint(
			detail.description,
			quantity,
		)

		const item: CarbonRecordItem = {
			name: detail.description,
			amount,
			quantity,
			category: 'other', // 預設分類，可以根據商品名稱進一步分類
			co2Amount: result.data.carbonFootprint || 0,
		}

		return item
	})

	const items = await Promise.all(itemsPromises)

	// 計算總碳排放量
	const totalCO2 = items.reduce((sum, item) => sum + item.co2Amount, 0)

	// 建立碳足跡記錄
	const carbonRecord: CarbonRecord = {
		id: invoice.invNum, // 使用發票號碼作為 ID
		invoiceNumber: invoice.invNum,
		date: invoice.invDate,
		storeName: invoice.sellerName,
		totalAmount: Number.parseFloat(invoice.amount),
		category: 'other', // 預設分類
		totalCO2: Number(totalCO2.toFixed(4)),
		items,
	}

	return carbonRecord
}
