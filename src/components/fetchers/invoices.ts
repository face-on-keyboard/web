import { useQuery } from '@tanstack/react-query'
import { client } from './client'
import type { CarbonRecord } from '@/lib/carbon-records'

export const useInvoices = () =>
  useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await client.api.invoices.$get()

      if (!response.ok) {
        throw new Error('無法獲取統一發票數據')
      }

      const result = await response.json()
      const invoices = result.data

      // Transform the invoice data to match the expected CarbonRecord structure
      const records: CarbonRecord[] = invoices.map((invoice) => ({
        id: `${invoice.invNum}-${invoice.invDate}`,
        invoiceNumber: invoice.invNum,
        date: invoice.invDate,
        storeName: invoice.sellerName || '未知商店',
        totalAmount: Number(invoice.amount) || 0,
        category: 'other', // Default category, could be enhanced with categorization logic
        totalCO2: 0, // Would need to be calculated from items
        items:
          invoice.details?.map((detail) => ({
            name: detail.description,
            amount: Number(detail.amount),
            quantity: Number(detail.quantity),
            category: 'other',
            co2Amount: 0, // Would need carbon calculation
          })) || [],
      }))

      return records
    },
  })
