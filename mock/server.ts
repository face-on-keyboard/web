import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod/v4'

const getInvoiceSchema = z.object({
  version: z.literal('0.5').describe('版本號碼'),
  cardType: z.string().describe('卡別'),
  cardNo: z.string().describe('手機條碼/卡片(載具)隱碼'),
  expTimeStamp: z.string().describe('有效存續時間戳記'),
  action: z.literal('carrierInvDetail').describe('API 行為'),
  timeStamp: z.string().describe('時間戳記'),
  invNum: z.string().describe('發票號碼'),
  invDate: z
    .string()
    .regex(/^\d{4}\/\d{2}\/\d{2}$/)
    .describe('發票日期(yyyy/MM/dd)'),
  uuid: z.string(),
  amount: z.string().optional(),
  sellerName: z.string().optional(),
  appID: z.string(),
  cardEncrypt: z.string(),
})

const InvoiceDetailSchema = z.object({
  rowNum: z.string().describe('明細編號'),
  description: z.string().describe('品名'),
  quantity: z.string().describe('數量'),
  unitPrice: z.string().describe('單價'),
  amount: z.string().describe('小計'),
})

const InvoiceSchema = z.object({
  v: z.string().describe('版本號碼'),
  code: z.string().describe('訊息回應碼'),
  msg: z.string().describe('系統回應訊息'),
  invNum: z.string().describe('發票號碼'),
  invDate: z.string().describe('發票開立日期'),
  sellerName: z.string().describe('賣方名稱'),
  amount: z.string().describe('總金額'),
  invStatus: z.string().describe('發票狀態'),
  invPeriod: z.string().describe('發票期別'),
  sellerBan: z.string().describe('賣方營業人統編'),
  sellerAddress: z.string().describe('賣方營業人地址'),
  invoiceTime: z.string().describe('發票開立時間 (HH:mm:ss)'),
  buyerBan: z.string().describe('買方營業人統編'),
  currency: z.string().describe('幣別'),
  details: z.array(InvoiceDetailSchema).describe('發票明細'),
})

const app = new Hono()
app.get(
  '/PB2CAPIVAN/invServ/InvServ',
  zValidator('param', getInvoiceSchema),
  (c) => c.json({ hello: 'world' })
)

serve({
  fetch: app.fetch,
  port: 3001,
})
