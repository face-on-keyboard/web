import { locationSchema } from '@/lib/schemas'
import { getTravelMode } from '@/lib/speed'
import { db } from '@/server/db'
import { zValidator } from '@hono/zod-validator'
import { distance, point } from '@turf/turf'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { invoiceApi } from 'mock/client'
import { invoiceToCarbonRecords } from './invoice-carbon'
import { success } from './jsend'

export const DEBUG_USER_EMAIL = 'john@example.com'

const app = new Hono().basePath('/api')

const routes = app
	.get('/status', (c) => {
		return c.json(
			success({
				timestamp: new Date().getTime(),
			}),
		)
	})
	.get('/segments', async (c) => {
		const segments = await db.segments.findMany({
			where: {
				userEmail: DEBUG_USER_EMAIL,
			},
		})

		return c.json(success(segments))
	})
	.put('/segments', zValidator('json', locationSchema), async (c) => {
		const segment = c.req.valid('json')

		const from = point([segment.start_x, segment.start_y])
		const to = point([segment.end_x, segment.end_y])

		// km
		const travelDistance = distance(from, to, { units: 'kilometers' })

		// km/h
		const travelSpeed =
			travelDistance /
			((new Date(segment.end_time).getTime() -
				new Date(segment.start_time).getTime()) /
				1000 /
				60 /
				60)

		const { travelMode, estimatedCO2 } = getTravelMode(travelSpeed)

		const createdSegment = await db.segments.create({
			data: {
				startX: segment.start_x,
				startY: segment.start_y,
				endX: segment.end_x,
				endY: segment.end_y,
				fromTime: segment.start_time,
				toTime: segment.end_time,
				userEmail: DEBUG_USER_EMAIL,
				travelMode,
				estimatedCO2: estimatedCO2 * travelDistance,
			},
		})

		return c.json(success(createdSegment))
	})
	.get('/invoices', async (c) => {
		const invoiceNumbers = [
			'AB12345678',
			'CD87654321',
			'EF11223344',
			'GH44332211',
			'IJ55667788',
		]

		const invoices = await Promise.all(
			invoiceNumbers.map(async (invNum) => {
				const invoiceResponse =
					await invoiceApi.PB2CAPIVAN.invServ.InvServ.$post({
						form: {
							version: '0.5',
							action: 'carrierInvDetail',
							timeStamp: new Date().toISOString(),
							invNum,
							invDate: '2023/01/01',
							appID: 'TESTAPPID',
							cardType: '3J0002',
							cardNo: '1234567890',
							expTimeStamp: new Date(
								Date.now() + 7 * 24 * 60 * 60 * 1000,
							).toISOString(),
							uuid: 'TESTUUID',
							cardEncrypt: 'TESTCARDENCRYPT',
						},
					})

				if (!invoiceResponse.ok) {
					throw new Error('無法獲取統一發票數據')
				}

				return invoiceToCarbonRecords(await invoiceResponse.json())
			}),
		)

		return c.json(success(invoices))
	})
export const GET = handle(app)
export const PUT = handle(app)

export type AppType = typeof routes
