import { hc } from 'hono/client'
import type { InvoiceAPI } from 'mock/server'
import { env } from '@/env'

export const invoiceApi = hc<InvoiceAPI>(env.INVOICE_API_BASE_URL)
