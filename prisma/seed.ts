import { db } from '@/server/db'
import fs from 'node:fs'
import path from 'node:path'
import z from 'zod'

import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const carbonLabelSchema = z.array(
  z.object({
    productType: z.string(),
    productName: z.string(),
    productModel: z.string().optional().nullable(),
    status: z.string().optional(),
    companyName: z.string().optional().nullable(),
    uniformNumber: z.coerce.string().optional().nullable(),
    carbonFootprint: z.string(),
    declarationUnit: z.string(),
  })
)

async function main() {
  const jsonPath = path.join(__dirname, '../data/carbon-label.json')
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  const validatedCarbonLabel = carbonLabelSchema.parse(data)

  await db.carbonLabel.createMany({
    data: validatedCarbonLabel.map((item) => {
      const match = item.carbonFootprint.match(/^([\d.]+)(.*)$/)
      const carbonFootprintValue = match
        ? Number.parseFloat(match[1] ?? '0')
        : 0
      const carbonFootprintUnit = match ? match?.[2]?.trim() : ''

      return {
        productType: item.productType,
        productName: item.productName,
        productModel: item.productModel,
        status: item.status,
        companyName: item.companyName,
        uniformNumber: item.uniformNumber,
        carbonFootprintValue,
        carbonFootprintUnit,
        declarationUnit: item.declarationUnit,
      }
    }),
  })
}

main()
  .catch((e) => {
    console.error('生成資料時發生錯誤:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
