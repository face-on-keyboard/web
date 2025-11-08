import { faker } from '@faker-js/faker'

// 生成台灣公司名稱
export function generateTaiwanCompanyName() {
	const companyTypes = [
		'股份有限公司',
		'有限公司',
		'企業有限公司',
		'實業有限公司',
	]
	const prefix = faker.company.name().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
	return `${prefix}${faker.helpers.arrayElement(companyTypes)}`
}

// 生成台灣地址（使用真實的台北地址）
export function generateTaiwanAddress() {
	const realAddresses = [
		'臺北市中正區寧波東街1-1號',
		'臺北市內湖區舊宗路一段268號',
		'臺北市中正區羅斯福路二段68號',
		'臺北市松山區南京東路四段2號',
		'臺北市大安區建國南路二段125號',
		'臺北市中山區中山北路三段181號',
		'臺北市文山區新光路二段30號',
		'臺北市士林區承德路五段55號',
	]
	return faker.helpers.arrayElement(realAddresses)
}

// 生成發票號碼（格式：兩個英文字母 + 8 位數字）
export function generateInvoiceNumber() {
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const letter1 = faker.helpers.arrayElement(letters.split(''))
	const letter2 = faker.helpers.arrayElement(letters.split(''))
	const numbers = faker.string.numeric(8)
	return `${letter1}${letter2}${numbers}`
}

// 生成統一編號（8 位數字）
export function generateBan() {
	return faker.string.numeric(8)
}

// 生成發票期別（YYYYMM，民國年雙數月）
export function generateInvPeriod(date: Date) {
	const year = date.getFullYear() - 1911 // 轉換為民國年
	const month = faker.helpers.arrayElement([2, 4, 6, 8, 10, 12]) // 雙數月
	return `${year}${month.toString().padStart(2, '0')}`
}

// 生成時間格式 HH:mm:ss
export function generateTime() {
	const hours = faker.number
		.int({ min: 0, max: 23 })
		.toString()
		.padStart(2, '0')
	const minutes = faker.number
		.int({ min: 0, max: 59 })
		.toString()
		.padStart(2, '0')
	const seconds = faker.number
		.int({ min: 0, max: 59 })
		.toString()
		.padStart(2, '0')
	return `${hours}:${minutes}:${seconds}`
}

// 生成商品名稱
export function generateProductName() {
	const products = [
		'瓶裝水',
		'土司',
		'衛生紙',
		'紅茶',
		'鳳梨酥',
		'綠茶',
		'高粱酒',
		'雞肉',
		'豬排',
		'咖啡',
	]
	return faker.helpers.arrayElement(products)
}
