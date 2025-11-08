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
// 注意：交通運輸項目不在發票中，由另一個網頁計算移動方式
function categorizeItem(itemName: string, category?: string): string {
  const name = itemName.toLowerCase()
  
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
    food: 0.08,      // 每元約 0.08kg CO2
    shopping: 0.10,  // 每元約 0.10kg CO2
    other: 0.05,     // 每元約 0.05kg CO2
  }
  
  const factor = factors[category] ?? factors.other ?? 0.05
  return Number((amount * factor).toFixed(2))
}

// 輔助函數：將日期轉換為 YYYY-MM-DD 格式
function formatDate(date: Date): string {
  const isoString = date.toISOString()
  const datePart = isoString.split('T')[0]
  if (!datePart) {
    // 如果意外發生，返回當前日期
    return new Date().toISOString().split('T')[0] || ''
  }
  return datePart
}

// 模擬統一發票 API 數據
// 實際應用中，這裡應該調用財政部的統一發票 API
async function fetchInvoices(): Promise<InvoiceItem[]> {
  // TODO: 替換為實際的統一發票 API 調用
  // 目前使用模擬數據作為示例
  
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 模擬發票數據
  // 注意：交通運輸項目不在發票中，由另一個網頁計算移動方式
  return [
    {
      id: '1',
      invoiceNumber: 'AB12345678',
      date: formatDate(new Date()),
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
      date: formatDate(new Date(Date.now() - 86400000)), // 昨天
      storeName: '全聯福利中心',
      items: [
        { name: '生鮮食品', amount: 350, quantity: 1, category: 'food' },
        { name: '日用品', amount: 200, quantity: 1, category: 'shopping' },
      ],
      totalAmount: 550,
    },
    {
      id: '3',
      invoiceNumber: 'EF34567890',
      date: formatDate(new Date(Date.now() - 172800000)), // 兩天前
      storeName: '家樂福',
      items: [
        { name: '生活用品', amount: 450, quantity: 1, category: 'shopping' },
        { name: '零食', amount: 120, quantity: 1, category: 'food' },
      ],
      totalAmount: 570,
    },
    {
      id: '4',
      invoiceNumber: 'GH45678901',
      date: formatDate(new Date(Date.now() - 259200000)), // 三天前
      storeName: '誠品書店',
      items: [
        { name: '書籍', amount: 380, quantity: 1 },
        { name: '文具用品', amount: 150, quantity: 1 },
      ],
      totalAmount: 530,
    },
    {
      id: '5',
      invoiceNumber: 'IJ56789012',
      date: formatDate(new Date(Date.now() - 345600000)), // 四天前
      storeName: '康是美藥妝店',
      items: [
        { name: '醫療用品', amount: 280, quantity: 1 },
        { name: '保養品', amount: 450, quantity: 1 },
      ],
      totalAmount: 730,
    },
    {
      id: '6',
      invoiceNumber: 'KL67890123',
      date: formatDate(new Date(Date.now() - 432000000)), // 五天前
      storeName: '電信服務',
      items: [
        { name: '通話費', amount: 500, quantity: 1 },
        { name: '網路服務費', amount: 699, quantity: 1 },
      ],
      totalAmount: 1199,
    },
    {
      id: '7',
      invoiceNumber: 'MN78901234',
      date: formatDate(new Date(Date.now() - 518400000)), // 六天前
      storeName: '加油站',
      items: [
        { name: '加油服務', amount: 1200, quantity: 1 },
      ],
      totalAmount: 1200,
    },
  ]
}

export async function GET(request: Request) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] GET /api/invoices - Request started`)
    
    // 記錄請求資訊
    const url = new URL(request.url)
    console.log(`[${requestId}] Request URL:`, url.toString())
    console.log(`[${requestId}] Request headers:`, Object.fromEntries(request.headers.entries()))
    
    console.log(`[${requestId}] Fetching invoices...`)
    const invoices = await fetchInvoices()
    console.log(`[${requestId}] Fetched ${invoices.length} invoices`)
    
    // 將發票數據轉換為碳排放記錄，保留完整發票信息
    console.log(`[${requestId}] Processing carbon records...`)
    const carbonRecords = invoices.map((invoice, index) => {
      console.log(`[${requestId}] Processing invoice ${index + 1}/${invoices.length}: ${invoice.invoiceNumber}`)
      
      // 計算發票中每個商品的碳排放
      const itemsWithCO2 = invoice.items.map(item => {
        const category = categorizeItem(item.name, item.category)
        const co2Amount = calculateCO2FromAmount(item.amount, category)
        
        console.log(`[${requestId}]   Item: ${item.name} -> Category: ${category}, CO2: ${co2Amount}kg`)
        
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
      console.log(`[${requestId}]   Total CO2 for invoice ${invoice.invoiceNumber}: ${totalCO2}kg`)
      
      // 判斷主要類別（碳排放最多的類別）
      const categoryCounts = itemsWithCO2.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.co2Amount
        return acc
      }, {} as Record<string, number>)
      const mainCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'other'
      console.log(`[${requestId}]   Main category: ${mainCategory}`, categoryCounts)
      
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
    
    const totalRecords = carbonRecords.length
    const totalCO2 = carbonRecords.reduce((sum, record) => sum + record.totalCO2, 0)
    const processingTime = Date.now() - startTime
    
    console.log(`[${requestId}] Processing complete:`)
    console.log(`[${requestId}]   - Total records: ${totalRecords}`)
    console.log(`[${requestId}]   - Total CO2: ${totalCO2.toFixed(2)}kg`)
    console.log(`[${requestId}]   - Processing time: ${processingTime}ms`)
    
    const response = NextResponse.json({ records: carbonRecords })
    
    // 添加調試標頭
    response.headers.set('X-Request-ID', requestId)
    response.headers.set('X-Processing-Time', `${processingTime}ms`)
    response.headers.set('X-Records-Count', `${totalRecords}`)
    
    return response
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error(`[${requestId}] Error fetching invoices (${processingTime}ms):`, error)
    
    // 詳細錯誤資訊
    if (error instanceof Error) {
      console.error(`[${requestId}] Error name:`, error.name)
      console.error(`[${requestId}] Error message:`, error.message)
      console.error(`[${requestId}] Error stack:`, error.stack)
    }
    
    const errorResponse = NextResponse.json(
      { 
        error: '無法獲取統一發票數據',
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
    
    errorResponse.headers.set('X-Request-ID', requestId)
    errorResponse.headers.set('X-Processing-Time', `${processingTime}ms`)
    
    return errorResponse
  }
}

