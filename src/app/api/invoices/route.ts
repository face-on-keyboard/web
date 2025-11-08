import { NextResponse } from 'next/server'

// 統一發票消費紀錄的接口定義
interface InvoiceItem {
  id: string
  invoiceNumber: string // 發票號碼
  date: string // 發票日期
  storeName: string // 商店名稱
  items: {
    name: string // 商品名稱
    amount: number // 金額
    quantity: number // 數量
    category?: string // 商品類別
  }[]
  totalAmount: number // 總金額
}

// 根據商品名稱和類別判斷碳排放類別
function categorizeItem(itemName: string, category?: string): string {
  const name = itemName.toLowerCase()
  
  // 交通相關
  if (name.includes('汽油') || name.includes('柴油') || name.includes('加油') || 
      name.includes('捷運') || name.includes('公車') || name.includes('計程車') ||
      name.includes('uber') || name.includes('uber')) {
    return 'transport'
  }
  
  // 能源相關
  if (name.includes('電費') || name.includes('瓦斯') || name.includes('電力') ||
      name.includes('能源')) {
    return 'energy'
  }
  
  // 食物相關
  if (name.includes('餐廳') || name.includes('食物') || name.includes('餐') ||
      name.includes('飲料') || name.includes('咖啡') || name.includes('便當') ||
      name.includes('超商') || name.includes('7-11') || name.includes('全家') ||
      name.includes('萊爾富') || name.includes('ok')) {
    return 'food'
  }
  
  // 購物相關
  if (name.includes('購物') || name.includes('百貨') || name.includes('商店') ||
      name.includes('量販') || name.includes('超市') || category === 'shopping') {
    return 'shopping'
  }
  
  return 'other'
}

// 計算碳排放量（根據金額估算，簡化版）
function calculateCO2FromAmount(amount: number, category: string): number {
  // 簡化的碳排放係數（每元新台幣對應的 CO2 kg）
  // 實際應根據商品類別使用更精確的係數
  const factors: Record<string, number> = {
    transport: 0.15, // 每元約 0.15kg CO2
    energy: 0.12,    // 每元約 0.12kg CO2
    food: 0.08,      // 每元約 0.08kg CO2
    shopping: 0.10,  // 每元約 0.10kg CO2
    other: 0.05,     // 每元約 0.05kg CO2
  }
  
  const factor = factors[category] || factors.other
  return Number((amount * factor).toFixed(2))
}

// 模擬統一發票 API 數據
// 實際應用中，這裡應該調用財政部的統一發票 API
async function fetchInvoices(): Promise<InvoiceItem[]> {
  // TODO: 替換為實際的統一發票 API 調用
  // 目前使用模擬數據作為示例
  
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 模擬發票數據
  return [
    {
      id: '1',
      invoiceNumber: 'AB12345678',
      date: new Date().toISOString().split('T')[0],
      storeName: '7-ELEVEN 便利商店',
      items: [
        { name: '咖啡', amount: 45, quantity: 1, category: 'food' },
        { name: '便當', amount: 85, quantity: 1, category: 'food' },
      ],
      totalAmount: 130,
    },
    {
      id: '2',
      invoiceNumber: 'CD23456789',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 昨天
      storeName: '中油加油站',
      items: [
        { name: '95無鉛汽油', amount: 800, quantity: 20, category: 'transport' },
      ],
      totalAmount: 800,
    },
    {
      id: '3',
      invoiceNumber: 'EF34567890',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 兩天前
      storeName: '全聯福利中心',
      items: [
        { name: '生鮮食品', amount: 350, quantity: 1, category: 'food' },
        { name: '日用品', amount: 200, quantity: 1, category: 'shopping' },
      ],
      totalAmount: 550,
    },
  ]
}

export async function GET() {
  try {
    const invoices = await fetchInvoices()
    
    // 將發票數據轉換為碳排放記錄，保留完整發票信息
    const carbonRecords = invoices.map(invoice => {
      // 計算發票中每個商品的碳排放
      const itemsWithCO2 = invoice.items.map(item => {
        const category = categorizeItem(item.name, item.category)
        const co2Amount = calculateCO2FromAmount(item.amount, category)
        
        return {
          name: item.name,
          amount: item.amount,
          quantity: item.quantity,
          category,
          co2Amount,
        }
      })
      
      // 計算發票總碳排放
      const totalCO2 = itemsWithCO2.reduce((sum, item) => sum + item.co2Amount, 0)
      
      // 判斷主要類別（碳排放最多的類別）
      const categoryCounts = itemsWithCO2.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.co2Amount
        return acc
      }, {} as Record<string, number>)
      const mainCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'other'
      
      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        storeName: invoice.storeName,
        totalAmount: invoice.totalAmount,
        category: mainCategory,
        totalCO2,
        items: itemsWithCO2,
      }
    })
    
    return NextResponse.json({ records: carbonRecords })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: '無法獲取統一發票數據' },
      { status: 500 }
    )
  }
}

