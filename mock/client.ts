import { hc } from 'hono/client'
import type { InvoiceAPI } from './server'

export const invoiceApi = hc<InvoiceAPI>('http://localhost:3001')
