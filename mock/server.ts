import { stringToNumberHash } from '@/lib/hash'
import { faker } from '@faker-js/faker'
import { serve } from '@hono/node-server'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import {
  generateBan,
  generateInvPeriod,
  generateProductName,
  generateTaiwanAddress,
  generateTaiwanCompanyName,
  generateTime,
} from './faker'

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
  uuid: z.string().describe('行動工具 Unique ID'),
  sellerName: z.string().optional().describe('開立賣方名稱'),
  amount: z.string().optional().describe('金額'),
  appID: z.string().describe('透過財資中心申請之軟體 ID'),
  cardEncrypt: z.string().describe('手機條碼驗證碼/卡片(載具)驗證碼'),
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
  sellerAddress: z.string().nullable().describe('賣方營業人地址'),
  invoiceTime: z.string().describe('發票開立時間 (HH:mm:ss)'),
  buyerBan: z.string().nullable().describe('買方營業人統編'),
  currency: z.string().nullable().describe('幣別'),
  details: z.array(InvoiceDetailSchema).describe('發票明細'),
})

export type Invoice = z.infer<typeof InvoiceSchema>

const app = new Hono()

const route = app
  .onError((err, c) => {
    console.error(err)
    return c.json(err)
  })
  .post(
    '/PB2CAPIVAN/invServ/InvServ',
    zValidator('form', getInvoiceSchema),
    (c) => {
      const params = c.req.valid('form')
      faker.seed(stringToNumberHash(params.invNum)) // Set seed for reproducibility

      const invDate = faker.date.recent({ days: 14 })
      const invPeriod = generateInvPeriod(invDate)

      const detailCount = faker.number.int({ min: 1, max: 5 })

      const totalAmount = faker.number.float({
        min: 10,
        max: 10000,
        fractionDigits: 2,
      })

      const invoice: Invoice = {
        v: params.version,
        code: '200',
        msg: '成功',
        invNum: params.invNum,
        invDate: `${invDate.getFullYear().toString()}/${(invDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${invDate.getDate().toString().padStart(2, '0')}`,
        sellerName: generateTaiwanCompanyName(),
        amount: totalAmount.toFixed(2),
        invStatus: faker.helpers.arrayElement(['已開立', '已作廢', '已折讓']),
        invPeriod,
        sellerBan: generateBan(),
        sellerAddress: faker.datatype.boolean(0.8)
          ? generateTaiwanAddress()
          : null,
        invoiceTime: generateTime(),
        buyerBan: faker.datatype.boolean(0.3) ? generateBan() : null, // 買方營業人統編（30% 機率有）
        currency: faker.datatype.boolean(0.9)
          ? 'TWD'
          : faker.helpers.arrayElement(['USD', 'EUR', 'JPY']), // 幣別（90% 是台幣）
        details: Array.from({ length: detailCount }, (_, i) => {
          const quantity = faker.number.float({
            min: 1,
            max: 10,
            fractionDigits: 2,
          })
          const unitPrice = faker.number.float({
            min: 10,
            max: 1000,
            fractionDigits: 2,
          })

          return {
            rowNum: (i + 1).toString(),
            description: generateProductName(),
            quantity: quantity.toString(),
            unitPrice: unitPrice.toString(),
            amount: Number.parseFloat(
              (quantity * unitPrice).toFixed(2)
            ).toString(),
          }
        }),
      }

      console.log(invoice)

      return c.json(invoice)
    }
  )

serve({
  fetch: app.fetch,
  port: 3001,
})

export type InvoiceAPI = typeof route
