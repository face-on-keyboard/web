export interface CarbonRecordItem {
  name: string
  amount: number
  quantity: number
  category: string
  co2Amount: number
}

export interface CarbonRecord {
  id: string
  invoiceNumber: string
  date: string
  storeName: string
  totalAmount: number
  category: string
  totalCO2: number
  items: CarbonRecordItem[]
}

export interface MonthlyStats {
  currentMonth: number
  lastMonth: number
  difference: number
  percentage: number
  isIncrease: boolean
}

export type CategoryColor = string

export interface DailyCarbonDelta {
  today: number
  yesterday: number
  difference: number
  percentageChange: number
  isIncrease: boolean
}

export interface MockCarbonData {
  records: CarbonRecord[]
  loading: boolean
  error: string | null
  dailyDelta: DailyCarbonDelta
}
