import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { success } from './jsend'
import { zValidator } from '@hono/zod-validator'
import { db } from '@/server/db'
import { point, distance } from '@turf/turf'
import { getTravelMode } from '@/lib/speed'
import { locationSchema } from '@/lib/schemas'

export const DEBUG_USER_EMAIL = 'john@example.com'

const app = new Hono().basePath('/api')

const routes = app
  .get('/status', (c) => {
    return c.json(
      success({
        timestamp: new Date().getTime(),
      })
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
    const invoices = await db.invoice.findMany({
      include: {
        details: true,
      },
    })

    return c.json(success(invoices))
  })

export const GET = handle(app)
export const PUT = handle(app)

export type AppType = typeof routes
